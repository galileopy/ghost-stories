import { pipe } from 'rxjs'

import {
  map, filter, flatMap,
} from 'rxjs/operators'

import Field from '../../adt/unions/field'

export const toBody = pipe(
  filter(x => Field.Saving.hasInstance(x.payload)),
  map(x => ({ params: x.payload.value })),
)

export const makePostRequest = endpoint => flatMap(
  ({ params, options }) => Field.mapPromise(
    params,
    endpoint({ params, options })
      .then(x => x.json()),
  ),
)
