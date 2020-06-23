import { pipe } from "rxjs";

import { flatMap, map, withLatestFrom, filter } from "rxjs/operators";

import { mergeAll } from "ramda";

import Resource from "../unions/Resource";

export const toParams = pipe(
  filter((x) => Resource.Query.hasInstance(x.payload)),
  map((x) => ({ params: x.payload.params }))
);

export const authFromState = (state$) =>
  pipe(
    withLatestFrom(
      state$.pipe(
        map((state) => ({
          options: {
            headers: {
              "x-access-token": state.auth.token,
            },
          },
        }))
      )
    ),
    map(mergeAll)
  );

export const makeRequest = (endpoint) =>
  flatMap(({ params, options }) =>
    Resource.mapPromise(
      params,
      endpoint({ params, options }).then((x) => x.json())
    )
  );

export const makeBlobRequest = (endpoint) =>
  flatMap(({ params, options }) =>
    Resource.mapPromiseBlob(
      params,
      endpoint({ params, options })
        .then((res) => res.blob())
        .then((blob) => ({ blob, params }))
    )
  );
