---
title: Claude code
excerpt: Comando y Conceptos Básicos de Claude Code
category: Article
published: true
publishedAt: '2026-08-27T13:30:43.049Z'
tags:
  - claude
---

Para poder optimizar nuestros tiempos he dejado una lista algunos comano de claude code para el dia a dia

<mark class="h-ok">/init </mark> → crea [cluade.mp](http://cluade.mp)

<mark class="h-ok">/context </mark> → información de tokens y memoria

<mark class="h-ok">/permissions</mark> → interfaz para gestionar permisos

<mark class="h-ok">/skill-creator </mark> \- crear una skill

<mark class="h-ok">/hooks</mark> - ves el listado de los hooks disponibles

<mark class="h-ok">/pluggins</mark> - es para ver todos los pluggins existentes

<mark class="h-ok">/agentes</mark> - listado de todos los agentes, tanto los build in como los creados

```ts
@"name-of-agente (agent)" analyze the code - para ejecutar tu agente
```

**¿Cuál es el propósito principal de los hooks en Claude Code?**:  
Para ejecutar lógica personalizada en puntos específicos del ciclo de vida del agente.

### **¿Cuál es la diferencia entre una skill y un agente?**

- **Una Habilidad (Skill):** Es una herramienta puntual que activas **dentro** de tu conversación actual. Es como una "función" o comando rápido (por ejemplo, pedirle a la IA que use una herramienta para buscar en internet o que aplique un formato específico a un texto).
- **Un Agente:** Es un **entorno o entidad independiente** configurado con un rol específico, instrucciones detalladas y su propio espacio de memoria. Trabaja de forma aislada a tu flujo principal.
