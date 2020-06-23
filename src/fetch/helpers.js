import { mergeDeepRight, isEmpty } from "ramda";
import { FIX_URL } from "../constants";

// SOLICITUDES REALIZADAS CON POST
export const poster = (url, fix) => ({ params, options }) => {
  const prefix = isEmpty(url) ? "" : `${url}/`;
  const realUrl = fix ? `${prefix}${fix}` : url;
  const opts = mergeDeepRight(
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: params,
    },
    options
  );
  return fetch(realUrl, opts);
};

// SOLICITUDES REALIZADAS CON JSON POST
export const jsonPoster = (url) => ({ params, options }) =>
  poster(
    url,
    params[FIX_URL]
  )({
    params: JSON.stringify(params),
    options: mergeDeepRight(options, {
      headers: {
        "Content-Type": "application/json",
      },
    }),
  });

// SOLICITUDES REALIZADAS CON JSON PUT
export const jsonPut = (url) => ({ params, options }) =>
  poster(
    url,
    params[FIX_URL]
  )({
    params: JSON.stringify(params),
    options: mergeDeepRight(options, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }),
  });

// SOLICITUDES REALIZADAS CON JSON DELETE
export const jsonDelete = (url) => ({ params, options }) =>
  poster(
    url,
    params[FIX_URL]
  )({
    params: JSON.stringify(params),
    options: mergeDeepRight(options, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }),
  });

export const bodyPoster = (url) => ({ params, options }) =>
  poster(url, params[FIX_URL])({ params, options });

// SOLICITUDES HECHAS CON QUERY STRING SON TODAS IGUALES
const qs = (params) =>
  Object.keys(params)
    .map(
      (k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`
    )
    .join("&");

export const qsGetter = (url) => ({ params, options }) => {
  const prefix = isEmpty(url) ? "" : `${url}/`;
  const realUrl = params[FIX_URL] ? `${prefix}${params[FIX_URL]}` : url;
  const query = qs(params);
  const suffix = isEmpty(query) ? "" : `?${query}`;
  return fetch(
    `${realUrl}${suffix}`,
    Object.assign(
      {},
      {
        method: "GET",
      },
      options
    )
  );
};
