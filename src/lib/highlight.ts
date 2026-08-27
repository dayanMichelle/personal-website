import { createLowlight } from "lowlight";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

/**
 * Solo los lenguajes que se van a usar: el paquete completo de highlight.js
 * son cientos de gramáticas y aquí se cargan en el cliente.
 */
export const lowlight = createLowlight();

lowlight.register({ typescript, javascript: typescript, bash, json, python, java, go, sql, css, html: xml, xml, yaml });

/** El primer alias es el que se guarda en la valla del Markdown (```ts). */
export const CODE_LANGUAGES = [
  { id: "ts", grammar: "typescript", label: "TypeScript" },
  { id: "js", grammar: "javascript", label: "JavaScript" },
  { id: "json", grammar: "json", label: "JSON" },
  { id: "bash", grammar: "bash", label: "Shell" },
  { id: "python", grammar: "python", label: "Python" },
  { id: "java", grammar: "java", label: "Java" },
  { id: "go", grammar: "go", label: "Go" },
  { id: "sql", grammar: "sql", label: "SQL" },
  { id: "html", grammar: "html", label: "HTML" },
  { id: "css", grammar: "css", label: "CSS" },
  { id: "yaml", grammar: "yaml", label: "YAML" },
] as const;

export const grammarFor = (id: string) =>
  CODE_LANGUAGES.find((l) => l.id === id || l.grammar === id)?.grammar ?? null;
