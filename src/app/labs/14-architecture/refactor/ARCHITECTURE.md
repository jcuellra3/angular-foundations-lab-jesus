# Arquitectura del catálogo

## Por qué se divide el componente

En `LegacyCatalogPage` todo estaba junto en un mismo archivo: la llamada HTTP, el guardado en `localStorage`, el estado, la ordenación y el HTML. Al separar por capas cada archivo tiene una única tarea y es más fácil modificar una parte sin romper las demás.

## Responsabilidad de cada capa

- **`data-access/product.repository.ts`**: Hace la petición HTTP a `/api/products?limit=4`, devuelve `response.items` y guarda los datos en `localStorage`. Ninguna otra capa sabe qué URL o formato usa el servidor.
- **`state/product-catalog.store.ts`**: Guarda el estado con señales privadas (`#products`, `#message`), expone los productos ordenados con `computed()` y coordina la carga llamando al repositorio.
- **`ui/product-list.ts`**: Componente presentacional que solo recibe la lista por `input()` y avisa mediante `output()` cuando el usuario pulsa un producto.
- **`product-catalog-page.ts`**: Conecta la vista con el _store_: ejecuta `load()` al pulsar el botón y pasa los eventos de `ProductList` al _store_.

## Dirección de dependencias

`product-catalog-page.ts` depende de `state/` y `ui/`. A su vez, `state/` depende de `data-access/`. Ni `ui/` ni `data-access/` importan nada de las capas superiores.

## Decisiones y tradeoffs

- **Más archivos para hacer lo mismo**: Ahora hay 4 archivos en lugar de 1, lo que añade algo más de código inicial, pero evita mezclar HTTP con la plantilla HTML.
- **Ordenación en el Store y no en el Repository**: La ordenación alfabética se deja en `sortedProducts` (`computed`) porque es cómo queremos mostrar los datos en esta pantalla, sin alterar lo que devuelve el repositorio.
- **Persistencia en `data-access`**: Se mueve `localStorage` al repositorio para sacar efectos del navegador fuera de la página y del _store_.
