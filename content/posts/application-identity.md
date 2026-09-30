---
title: Application identity
excerpt: >-
  1\. Usuario → Navegador: "Quiero entrar". El usuario hace clic en "Iniciar
  sesión" en tu app. Todavía no pasa nada de OAuth.
category: Article
published: true
publishedAt: '2026-09-28T18:25:16.087Z'
series: Oauth 2.0
seriesOrder: 3
---

![](/uploads/2026/oauth-81ab1c.png)

**1\. Usuario → Navegador: "Quiero entrar".** El usuario hace clic en "Iniciar sesión" en tu app. Todavía no pasa nada de OAuth.

**2\. Navegador → Server:** `GET /login`**.** El navegador le pide a tu backend que inicie el proceso. Es front channel porque sale desde el navegador. Quien controla el flujo es el Server, no el frontend.

**3\. El Server se prepara.** Antes de mandar al usuario a OAuth, el Server genera tres cosas y las guarda en la sesión del usuario:

- El `code_verifier`, un string aleatorio y largo. Es el secreto de PKCE y **no sale del Server** hasta el paso 10.
- El `code_challenge`, que es el hash SHA-256 del verifier en base64url. Es público: desde el hash no se puede obtener el verifier.
- El `state`, otro valor aleatorio para protegerse de CSRF.


**Ida al servidor OAuth (front channel)**

**4\. Server → Navegador: redirect 302.** El Server no llama a OAuth directamente. Responde con una redirección que le dice al navegador "anda a esta URL de `/authorize`". Así el usuario se loguea en la página de OAuth y nunca le entrega su contraseña a tu app.

**5\. Navegador → OAuth:** `GET /authorize`**.** El navegador sigue la redirección. En la URL van:

- `client_id`: quién pide el acceso.
- `redirect_uri`: a dónde volver. Debe coincidir exactamente con la registrada.
- `scope`: qué permisos se piden (photos).
- `state`: el valor aleatorio del paso 3.
- `code_challenge` y `code_challenge_method=S256`: el hash del verifier y el algoritmo usado.


Todo esto es visible en la URL, por eso aquí no va nada secreto.

**6\. Usuario ↔ OAuth: login y consentimiento.** El usuario ingresa sus credenciales en la página del proveedor y acepta los permisos ("Esta app quiere acceder a tus fotos"). El servidor OAuth guarda el `code_challenge` asociado a lo que está por emitir.

**Vuelta con el code (front channel)**

**7\. OAuth → Navegador: redirect a** `redirect_uri?code=...&state=...`**.** OAuth genera el authorization code (temporal y de un solo uso) y redirige al navegador de vuelta a tu app. El code viaja por el canal inseguro, pero por sí solo no sirve de nada.

**8\. Navegador → Server:** `GET /callback`**.** El navegador llega a tu `redirect_uri`, que es un endpoint de tu backend, trayendo el `code` y el `state`.

**9\. El Server valida el** `state`**.** Compara el `state` que llegó con el que guardó en el paso 3. Si no coincide, alguien pudo haber inyectado un code ajeno, y el Server corta el flujo.

**Canje del code (back channel)**

**10\. Server → OAuth:** `POST /token`**.** Ahora el Server habla directo con OAuth, sin navegador. Envía:

- `grant_type=authorization_code`: el tipo de flujo.
- `code`: el que recibió en el paso 8.
- `redirect_uri`: la misma del paso 5, como verificación extra.
- `code_verifier`: el secreto original de PKCE.
- `client_id` y `client_secret`: prueban que es tu app y no un impostor.


OAuth verifica varias cosas: que el code sea válido y no esté usado, que `SHA256(code_verifier)` coincida con el `code_challenge` del paso 5, y que el `client_secret` corresponda al `client_id`.

**11\. OAuth → Server: tokens en JSON.** Si todo está bien, responde con:

- `access_token`: para llamar a la API, con el header `Authorization: Bearer ...`.
- `expires_in`: cuántos segundos dura (3600 = 1 hora).
- `refresh_token`: para pedir un access token nuevo cuando expire, sin que el usuario vuelva a loguearse.
- `scope`: los permisos que finalmente se otorgaron.
