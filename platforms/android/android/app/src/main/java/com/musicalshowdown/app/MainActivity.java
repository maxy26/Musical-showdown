package com.musicalshowdown.app;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Complemento propio: encontrar la PC con el código de vinculación (VinculoPlugin)
        registerPlugin(VinculoPlugin.class);
        // Complemento propio: compras dentro del juego con Google Play (ComprasPlugin)
        registerPlugin(ComprasPlugin.class);
        super.onCreate(savedInstanceState);

        // Android 15 y 16 dibujan la app debajo de la barra de la hora y de los botones
        // de abajo, y el WebView no avisa cuánto miden: el juego quedaba tapado
        // (12-10-2026). El juego empieza debajo de esas barras (y arriba del teclado),
        // con el fondo del juego detrás.
        View raiz = findViewById(android.R.id.content);
        raiz.setBackgroundColor(Color.parseColor("#0B0D17"));
        ViewCompat.setOnApplyWindowInsetsListener(raiz, (v, insets) -> {
            Insets barras = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets teclado = insets.getInsets(WindowInsetsCompat.Type.ime());
            v.setPadding(barras.left, barras.top, barras.right, Math.max(barras.bottom, teclado.bottom));
            return WindowInsetsCompat.CONSUMED;
        });
        ocultarBarras();
    }

    /**
     * Pantalla completa (usuario, 29-10-2026): sin la barra de la hora ni la de los botones; salen un
     * momento deslizando desde el borde. Al estar ocultas no miden nada, así el juego ocupa toda la
     * pantalla (el recorte de la cámara se sigue respetando).
     */
    private void ocultarBarras() {
        WindowInsetsControllerCompat control = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        control.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        control.hide(WindowInsetsCompat.Type.systemBars());
    }

    // Al volver al juego (otra app, un permiso, el teclado) Android puede mostrarlas de nuevo
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) ocultarBarras();
    }
}
