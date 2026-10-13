package com.musicalshowdown.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Encontrar la PC en la red Wi-Fi con el código de vinculación (partida en dos
 * dispositivos, 12-10-2026; ver src/js/vinculo.js). El celular grita un mensaje
 * a toda la red ("MSV1 BUSCAR 123456" o "MSV1 COMPARTE 123456") y la PC que
 * tiene ese código le contesta solo a él con su dirección. No usa internet.
 */
@CapacitorPlugin(name = "Vinculo")
public class VinculoPlugin extends Plugin {

    private static final int PUERTO = 47822;

    @PluginMethod
    public void buscar(PluginCall call) {
        final String mensaje = call.getString("mensaje", "");
        final String esperado = call.getString("esperado", "");
        final int segundos = call.getInt("segundos", 6);
        new Thread(() -> {
            try (DatagramSocket socket = new DatagramSocket()) {
                socket.setBroadcast(true);
                socket.setSoTimeout(400);
                byte[] datos = mensaje.getBytes(StandardCharsets.UTF_8);
                List<InetAddress> destinos = destinos();
                byte[] buffer = new byte[512];
                long fin = System.currentTimeMillis() + segundos * 1000L;
                while (System.currentTimeMillis() < fin) {
                    for (InetAddress destino : destinos) {
                        try {
                            socket.send(new DatagramPacket(datos, datos.length, destino, PUERTO));
                        } catch (Exception ignorado) {
                            // una red que no deja enviar: se prueba con las demás
                        }
                    }
                    try {
                        DatagramPacket paquete = new DatagramPacket(buffer, buffer.length);
                        socket.receive(paquete);
                        String respuesta = new String(paquete.getData(), 0, paquete.getLength(), StandardCharsets.UTF_8);
                        if (!respuesta.startsWith(esperado)) continue;
                        JSObject resultado = new JSObject();
                        resultado.put("ip", paquete.getAddress().getHostAddress());
                        resultado.put("respuesta", respuesta);
                        call.resolve(resultado);
                        return;
                    } catch (SocketTimeoutException sinRespuesta) {
                        // vuelve a gritar
                    }
                }
                call.reject("sin-respuesta");
            } catch (Exception e) {
                call.reject("sin-respuesta");
            }
        }).start();
    }

    /** Las direcciones "a todos" de cada red del celular (Wi-Fi, zona Wi-Fi) y la general. */
    private static List<InetAddress> destinos() {
        List<InetAddress> lista = new ArrayList<>();
        try {
            for (NetworkInterface red : Collections.list(NetworkInterface.getNetworkInterfaces())) {
                if (!red.isUp() || red.isLoopback()) continue;
                for (InterfaceAddress direccion : red.getInterfaceAddresses()) {
                    InetAddress todos = direccion.getBroadcast();
                    if (todos != null && !lista.contains(todos)) lista.add(todos);
                }
            }
            lista.add(InetAddress.getByName("255.255.255.255"));
        } catch (Exception ignorado) {
            // sin redes: la lista queda vacía y no se encuentra nada
        }
        return lista;
    }
}
