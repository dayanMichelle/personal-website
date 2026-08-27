---
title: Frontend Channel VS Backend Channel
excerpt: Frontend Channel VS Backend Channel
category: Guide
published: true
publishedAt: '2026-08-27T13:18:06.085Z'
tags:
  - oauth
series: Oauth 2.0
seriesOrder: 2
---

### **Backend Channel:**

Es una conexión directa cliente servidor sobre HTTPS. Con este certificado tu sabes con quién hablas, los datos van cifreados y nadie puede manipularlos. Vas directo al destinatario personalmente.

```ts
📌 El archivo de servicio donde haces llamadas en tu aplicación de una sola página (Single Page Application - SPA) con React puede considerarse un canal de retorno (back channel).
```

Is the following JavaScript code making a front-channel or back-channel request?

```ts
fetch("https://authorization-server.com/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then((response) => {
    return response.json();
  });
```

- **<mark class="h-ok">Back Channel</mark>**

    <mark class="h-ok">Aunque el método de la solicitud sea GET, se trata de una solicitud de canal secundario, ya que el código JavaScript gestiona directamente la respuesta HTTP.</mark>


### **Frontend Channel:**

literalmente, usar la barra de direcciones del navegador del usuario para pasar datos entre dos sistemas. Es como enviar una carta por correo, nadie puede garantizar que el remitentes es el correcto, que el mensaje no fue copiado o dañado, etc.

```ts
⚠ El flujo implícito cometía el error de devolver el access token también por el canal frontal (en la redirección), sin ningún canal trasero. Será deprecado.
```

Is the following JavaScript code making a front-channel or back-channel request?

```ts
window.location = 'https://authorization-server.com/authorize?client_id=example';
```
