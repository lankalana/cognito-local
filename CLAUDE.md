# cognito-local

Local emulator of the AWS Cognito Identity Provider API (fork of jagregory/cognito-local,
published as `cognito-local` from `lankalana/cognito-local`). Express server on port 9229,
TypeScript ESM, Node 26.

## Tooling

- Tools via `mise` (`node 26`, `aube`). **Package manager is `aube`, not npm/pnpm/yarn**
  (`aube install`, `aube ci`, `aube run <script>`, `aube test`). Lockfile is `aube-lock.yaml`.
- Lint/format: `oxlint` + `oxfmt` (not eslint/biome/prettier; leftover `biome-ignore`
  comments are stale). Type check with `tsc` (TypeScript 7).
- Tests: `vitest`.

| Task | Command |
| --- | --- |
| Run server (dev) | `aube start` / `aube run start:watch` |
| Unit tests | `aube run test:unit-test` |
| Integration tests | `aube run test:integration-test` |
| Single test file | `aube test --run src/targets/adminDeleteUser.test.ts` |
| Lint / autofix | `aube run lint` / `aube run lint:fix` |
| Type check | `aube run type-check` |
| Everything | `aube run validate` |
| Build to `lib/` | `aube run build` |

Pre-commit hook runs lint + type-check. CI (`.github/workflows/validate.yml`) runs lint,
type-check, unit, integration, plus smoke tests locally and in Docker.

## Layout

- `src/bin/start.ts` – CLI entry. `src/server/` – Express app (`server.ts`), `Router.ts`
  dispatches on the `x-amz-target` header, `hostedUi.ts` for OAuth/hosted login, `config.ts`.
- `src/targets/` – one file per Cognito API action (e.g. `adminDeleteUser.ts`) with a
  co-located `*.test.ts`. Registered in `src/targets/targets.ts`.
- `src/services/` – `cognitoService` (pools), `userPoolService` (users/groups/clients),
  `tokenGenerator`, `triggers/` (Lambda triggers), `messageDelivery/`, `dataStore/` (StormDB
  JSON files).
- `src/__tests__/` – shared mocks (`newMockCognitoService`, `newMockUserPoolService`, ...),
  `TestContext`, `testDataBuilder` (`TDB.user()` etc.), `ClockFake`.
- `integration-tests/aws-sdk/` – one test per action against a real server using the AWS SDK
  client via `withCognitoSdk` from `setup.ts`.
- `.cognito/` – local runtime data (`config.json`, `db/`), gitignored.

## Adding / changing an API action

1. `src/targets/<action>.ts`: export `type XTarget = Target<XRequest, XResponse>` using types
   from `@aws-sdk/client-cognito-identity-provider`, and a factory
   `X = ({ cognito, ... }: Pick<Services, ...>): XTarget => async (ctx, req) => {...}`.
   Validate required params with `MissingParameterError`; throw errors from `src/errors.ts`
   matching real Cognito error names/messages.
2. Register it in `src/targets/targets.ts`.
3. Unit test next to it using the mocks in `src/__tests__/`; add an integration test in
   `integration-tests/aws-sdk/`.
4. Update the "Supported Features" table in `README.md` (✅ / 🕒 partial / ❌).

## Conventions

- Match real AWS Cognito behaviour and response shapes; check the AWS API docs rather than
  guessing.
- Services are passed in via factory functions (`Pick<Services, ...>`), every call takes `ctx`
  (logger) first. Use the injected `clock` instead of `new Date()` so tests stay deterministic.
- Formatting is whatever `oxfmt` produces (2 spaces, double quotes); run `aube run lint:fix`
  rather than hand-formatting.
