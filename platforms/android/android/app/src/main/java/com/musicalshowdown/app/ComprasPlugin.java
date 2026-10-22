package com.musicalshowdown.app;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Compras dentro del juego con Google Play Billing (usuario, 13-10-2026; ver
 * src/js/compras.js). La suscripción "premium" desbloquea Alternativo 2,
 * escuchar el canto y quita los anuncios. El precio y los planes (mensual,
 * anual, prueba gratis) se configuran en la consola de Google Play; aquí solo
 * se leen.
 *   - productos: los planes con su precio en la moneda del jugador.
 *   - comprar: abre la ventana de pago de Google Play.
 *   - consultar: qué suscripciones están activas (al abrir el juego).
 * Las compras se "reconocen" (acknowledge) enseguida: si no, Google las
 * devuelve a los 3 días.
 */
@CapacitorPlugin(name = "Compras")
public class ComprasPlugin extends Plugin implements PurchasesUpdatedListener {

    private BillingClient cliente;
    private final Map<String, ProductDetails> productos = new HashMap<>();
    private PluginCall compraEnCurso;

    @Override
    public void load() {
        cliente = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .build();
    }

    /** Se conecta con Google Play (si hace falta) y después hace `listo`. */
    private void conectar(PluginCall call, Runnable listo) {
        if (cliente.isReady()) {
            listo.run();
            return;
        }
        cliente.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult resultado) {
                if (resultado.getResponseCode() == BillingClient.BillingResponseCode.OK) listo.run();
                else call.reject("sin-tienda", String.valueOf(resultado.getResponseCode()));
            }

            @Override
            public void onBillingServiceDisconnected() {
                // se vuelve a conectar en la próxima llamada
            }
        });
    }

    @PluginMethod
    public void productos(PluginCall call) {
        String id = call.getString("id", "premium");
        conectar(call, () -> {
            QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(Collections.singletonList(QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(id)
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build()))
                .build();
            cliente.queryProductDetailsAsync(params, (resultado, lista) -> {
                if (resultado.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject("sin-productos", String.valueOf(resultado.getResponseCode()));
                    return;
                }
                JSArray planes = new JSArray();
                for (ProductDetails detalle : lista) {
                    productos.put(detalle.getProductId(), detalle);
                    List<ProductDetails.SubscriptionOfferDetails> ofertas = detalle.getSubscriptionOfferDetails();
                    if (ofertas == null) continue;
                    for (ProductDetails.SubscriptionOfferDetails oferta : ofertas) {
                        List<ProductDetails.PricingPhase> fases = oferta.getPricingPhases().getPricingPhaseList();
                        if (fases.isEmpty()) continue;
                        // La última fase es el precio que se repite; una fase gratis es la prueba
                        ProductDetails.PricingPhase normal = fases.get(fases.size() - 1);
                        String prueba = "";
                        for (ProductDetails.PricingPhase fase : fases) {
                            if (fase.getPriceAmountMicros() == 0) prueba = fase.getBillingPeriod();
                        }
                        JSObject plan = new JSObject();
                        plan.put("producto", detalle.getProductId());
                        plan.put("plan", oferta.getBasePlanId());
                        plan.put("oferta", oferta.getOfferId());
                        plan.put("token", oferta.getOfferToken());
                        plan.put("precio", normal.getFormattedPrice());
                        plan.put("periodo", normal.getBillingPeriod());
                        plan.put("prueba", prueba);
                        planes.put(plan);
                    }
                }
                JSObject respuesta = new JSObject();
                respuesta.put("planes", planes);
                call.resolve(respuesta);
            });
        });
    }

    @PluginMethod
    public void comprar(PluginCall call) {
        String id = call.getString("producto", "premium");
        String token = call.getString("token");
        ProductDetails detalle = productos.get(id);
        if (detalle == null || token == null) {
            call.reject("sin-plan");
            return;
        }
        BillingFlowParams params = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(Collections.singletonList(BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(detalle)
                .setOfferToken(token)
                .build()))
            .build();
        conectar(call, () -> getActivity().runOnUiThread(() -> {
            compraEnCurso = call;
            BillingResult resultado = cliente.launchBillingFlow(getActivity(), params);
            if (resultado.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                compraEnCurso = null;
                call.reject("error", String.valueOf(resultado.getResponseCode()));
            }
        }));
    }

    @Override
    public void onPurchasesUpdated(BillingResult resultado, List<Purchase> compras) {
        PluginCall call = compraEnCurso;
        compraEnCurso = null;
        int codigo = resultado.getResponseCode();
        if (codigo == BillingClient.BillingResponseCode.OK && compras != null) {
            for (Purchase compra : compras) reconocer(compra);
            if (call != null) call.resolve(activos(compras));
        } else if (call != null) {
            if (codigo == BillingClient.BillingResponseCode.USER_CANCELED) call.reject("cancelada");
            else if (codigo == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) call.reject("ya-comprado");
            else call.reject("error", String.valueOf(codigo));
        }
    }

    @PluginMethod
    public void consultar(PluginCall call) {
        conectar(call, () -> cliente.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.SUBS).build(),
            (resultado, compras) -> {
                if (resultado.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject("error", String.valueOf(resultado.getResponseCode()));
                    return;
                }
                for (Purchase compra : compras) reconocer(compra);
                call.resolve(activos(compras));
            }));
    }

    /** Confirma a Google una compra nueva (si no, la devuelve a los 3 días). */
    private void reconocer(Purchase compra) {
        if (compra.getPurchaseState() != Purchase.PurchaseState.PURCHASED || compra.isAcknowledged()) return;
        cliente.acknowledgePurchase(
            AcknowledgePurchaseParams.newBuilder().setPurchaseToken(compra.getPurchaseToken()).build(),
            resultado -> { /* si falla, se reintenta en la próxima consulta */ });
    }

    /** { activos: ["premium", …] } con las compras pagadas. */
    private JSObject activos(List<Purchase> compras) {
        JSArray lista = new JSArray();
        for (Purchase compra : compras) {
            if (compra.getPurchaseState() != Purchase.PurchaseState.PURCHASED) continue;
            for (String producto : compra.getProducts()) lista.put(producto);
        }
        JSObject respuesta = new JSObject();
        respuesta.put("activos", lista);
        return respuesta;
    }
}
