---
title: Oauth 2.0
category: Guide
published: true
excerpt: Clase 1 | Oauth 2.0 Introducción
publishedAt: '2026-08-25T14:48:39.555Z'
tags:
  - oauth
series: Oauth 2.0
seriesOrder: 1
featured: true
---

OAuth es un protocolo. Específicamente, se define como un conjunto de especificaciones técnicas que brindan un marco para autorizar el acceso a recursos en línea.

Pero lo que OAuth hace a alto nivel es requerir que cada aplicación envíe al usuario al servidor OAuth para que inicie sesión allí, y luego lo redirija de vuelta a la aplicación para que ésta pueda obtener tokens. Y la clave aquí es este paso de redirección.

Esto significa que el usuario sale de la aplicación y teclea su contraseña en el servidor OAuth en lugar de dar su contraseña a la aplicación. Así que en cuanto evitamos que la aplicación vea nunca la contraseña del usuario, se resuelven todas estas preocupaciones e incertidumbres que teníamos antes.  
No existe un único sistema de autenticación OAuth para todas las empresas, sino que cada empresa puede implementar su propia versión del protocolo según sus necesidades específicas.

#### **La aplicación no necesita saber quién es el usuario para que esto funcione. Por otro lado, si la aplicación necesita saber quién es el usuario, por ejemplo, si quiere mostrar su nombre en la interfaz o mostrar su foto de perfil en la esquina, ahí es donde necesitamos algo más que OAuth, porque OAuth en realidad no nos da esa información. No hay nada en OAuth que comunique información del usuario, todo eso se añade externamente.**  
Ahora, la principal forma que se añade es usando OpenID Connect.

OpenID Connect toma OAuth como base y añade información sobre la identidad del usuario.  
Así, OAuth emite tokens de acceso a las aplicaciones, OpenID Connect emite tokens de identificación a las aplicaciones.

En la especificación OAuth, verás estos términos más específicos.

-   The User : Resource Owner
    
-   The Device: User Agent
    
-   The Applications: Client
    
-   The API: Resource Server
    

Authorization Server

-   El usuario sólo introducirá su contraseña en el servidor de autorización, por lo que la aplicación nunca verá la contraseña del usuario.  
      
    En OAuth 2.0, existen dos tipos de clientes: **confidenciales** y **públicos**, y su diferencia principal se basa en si el cliente puede o no usar credenciales para autenticarse durante el flujo de OAuth.  
      
    1\. **Clientes Públicos**:  
    \- No tienen credenciales que puedan ser utilizadas como autenticación.  
    \- Se presenta en aplicaciones donde los usuarios pueden acceder al código fuente, como aplicaciones móviles o aplicaciones de una sola página. Al ser visibles para los usuarios, los secretos no pueden ser incluidos, ya que esto comprometería la seguridad.  
    \- Por lo tanto, no existe manera de que el servidor de autorización pueda confirmar que las solicitudes hechas son genuinas.
    

2.  **Clientes Confidenciales**:  
    \- Tienen credenciales, típicamente un secreto de cliente.  
    \- Pueden ser aplicaciones que se ejecutan en un servidor, donde el código no es accesible por los usuarios. Esto significa que el secreto puede mantenerse a salvo porque los usuarios no pueden verlo en el código fuente.  
    \- Se utilizan en aplicaciones backend y en entornos donde se puede proteger el secreto.
    

```
Con diferencia, el tipo de credencial más utilizado con clientes confidenciales es el client secret.
Esto es básicamente lo mismo que una clave API o una contraseña.
Es una cadena de caracteres que comparten el servidor y el cliente.
Es el más común porque es el más fácil de usar, pero no es el más seguro. 
Una forma más segura de autenticación de clientes implica el uso de un par de claves pública/privada de alguna forma.
```

![](https://app.notion.com/image/attachment%3A552657bb-d364-49f8-94d5-09fc71b1ee23%3Aimage.png?table=block&id=3c177089-c86d-8019-97c2-cc78638fb046&spaceId=eecd17ab-8923-40cc-8144-e2bc7fcf265a&width=2000&userId=ee88658a-920f-4216-ac7b-7f0c98efc780&cache=v2&imgBuildSrc=requestProxiedImageUrl)

En realidad, la aplicación dirige primero al usuario al servidor de autorización. El usuario introduce allí su contraseña, aprueba la solicitud después de ver la pantalla de consentimiento y, a continuación, vuelve a la aplicación. De este modo, el usuario sólo tiene que introducir su contraseña en el servidor de autorización. Y este es el paso de consentimiento en el que se pregunta al usuario si desea compartir sus datos con la aplicación.  
  
_📌 Siempre debes implementar una mecánica de consentimiento en aplicaciones que actúan en nombre del usuario. Es esencial garantizar que los usuarios tengan control sobre su información personal._
