# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetPublicMovieList*](#getpublicmovielist)
  - [*GetMyWatchList*](#getmywatchlist)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*AddMovieToList*](#addmovietolist)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetPublicMovieList
You can execute the `GetPublicMovieList` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPublicMovieList(): QueryPromise<GetPublicMovieListData, undefined>;

interface GetPublicMovieListRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetPublicMovieListData, undefined>;
}
export const getPublicMovieListRef: GetPublicMovieListRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPublicMovieList(dc: DataConnect): QueryPromise<GetPublicMovieListData, undefined>;

interface GetPublicMovieListRef {
  ...
  (dc: DataConnect): QueryRef<GetPublicMovieListData, undefined>;
}
export const getPublicMovieListRef: GetPublicMovieListRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPublicMovieListRef:
```typescript
const name = getPublicMovieListRef.operationName;
console.log(name);
```

### Variables
The `GetPublicMovieList` query has no variables.
### Return Type
Recall that executing the `GetPublicMovieList` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPublicMovieListData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetPublicMovieListData {
  movieLists: ({
    id: UUIDString;
    name: string;
    description?: string | null;
  } & MovieList_Key)[];
}
```
### Using `GetPublicMovieList`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPublicMovieList } from '@dataconnect/generated';


// Call the `getPublicMovieList()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPublicMovieList();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPublicMovieList(dataConnect);

console.log(data.movieLists);

// Or, you can use the `Promise` API.
getPublicMovieList().then((response) => {
  const data = response.data;
  console.log(data.movieLists);
});
```

### Using `GetPublicMovieList`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPublicMovieListRef } from '@dataconnect/generated';


// Call the `getPublicMovieListRef()` function to get a reference to the query.
const ref = getPublicMovieListRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPublicMovieListRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.movieLists);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.movieLists);
});
```

## GetMyWatchList
You can execute the `GetMyWatchList` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyWatchList(): QueryPromise<GetMyWatchListData, undefined>;

interface GetMyWatchListRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyWatchListData, undefined>;
}
export const getMyWatchListRef: GetMyWatchListRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyWatchList(dc: DataConnect): QueryPromise<GetMyWatchListData, undefined>;

interface GetMyWatchListRef {
  ...
  (dc: DataConnect): QueryRef<GetMyWatchListData, undefined>;
}
export const getMyWatchListRef: GetMyWatchListRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyWatchListRef:
```typescript
const name = getMyWatchListRef.operationName;
console.log(name);
```

### Variables
The `GetMyWatchList` query has no variables.
### Return Type
Recall that executing the `GetMyWatchList` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyWatchListData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMyWatchListData {
  watchEntries: ({
    id: UUIDString;
    movie: {
      id: UUIDString;
      title: string;
    } & Movie_Key;
      watchDate: DateString;
  } & WatchEntry_Key)[];
}
```
### Using `GetMyWatchList`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyWatchList } from '@dataconnect/generated';


// Call the `getMyWatchList()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyWatchList();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyWatchList(dataConnect);

console.log(data.watchEntries);

// Or, you can use the `Promise` API.
getMyWatchList().then((response) => {
  const data = response.data;
  console.log(data.watchEntries);
});
```

### Using `GetMyWatchList`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyWatchListRef } from '@dataconnect/generated';


// Call the `getMyWatchListRef()` function to get a reference to the query.
const ref = getMyWatchListRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyWatchListRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.watchEntries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.watchEntries);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation has no variables.
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser } from '@dataconnect/generated';


// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef } from '@dataconnect/generated';


// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## AddMovieToList
You can execute the `AddMovieToList` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addMovieToList(vars: AddMovieToListVariables): MutationPromise<AddMovieToListData, AddMovieToListVariables>;

interface AddMovieToListRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddMovieToListVariables): MutationRef<AddMovieToListData, AddMovieToListVariables>;
}
export const addMovieToListRef: AddMovieToListRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addMovieToList(dc: DataConnect, vars: AddMovieToListVariables): MutationPromise<AddMovieToListData, AddMovieToListVariables>;

interface AddMovieToListRef {
  ...
  (dc: DataConnect, vars: AddMovieToListVariables): MutationRef<AddMovieToListData, AddMovieToListVariables>;
}
export const addMovieToListRef: AddMovieToListRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addMovieToListRef:
```typescript
const name = addMovieToListRef.operationName;
console.log(name);
```

### Variables
The `AddMovieToList` mutation requires an argument of type `AddMovieToListVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddMovieToListVariables {
  movieListId: UUIDString;
  movieId: UUIDString;
  positionInList: number;
}
```
### Return Type
Recall that executing the `AddMovieToList` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddMovieToListData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddMovieToListData {
  movieListEntry_insert: MovieListEntry_Key;
}
```
### Using `AddMovieToList`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addMovieToList, AddMovieToListVariables } from '@dataconnect/generated';

// The `AddMovieToList` mutation requires an argument of type `AddMovieToListVariables`:
const addMovieToListVars: AddMovieToListVariables = {
  movieListId: ..., 
  movieId: ..., 
  positionInList: ..., 
};

// Call the `addMovieToList()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addMovieToList(addMovieToListVars);
// Variables can be defined inline as well.
const { data } = await addMovieToList({ movieListId: ..., movieId: ..., positionInList: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addMovieToList(dataConnect, addMovieToListVars);

console.log(data.movieListEntry_insert);

// Or, you can use the `Promise` API.
addMovieToList(addMovieToListVars).then((response) => {
  const data = response.data;
  console.log(data.movieListEntry_insert);
});
```

### Using `AddMovieToList`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addMovieToListRef, AddMovieToListVariables } from '@dataconnect/generated';

// The `AddMovieToList` mutation requires an argument of type `AddMovieToListVariables`:
const addMovieToListVars: AddMovieToListVariables = {
  movieListId: ..., 
  movieId: ..., 
  positionInList: ..., 
};

// Call the `addMovieToListRef()` function to get a reference to the mutation.
const ref = addMovieToListRef(addMovieToListVars);
// Variables can be defined inline as well.
const ref = addMovieToListRef({ movieListId: ..., movieId: ..., positionInList: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addMovieToListRef(dataConnect, addMovieToListVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.movieListEntry_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.movieListEntry_insert);
});
```

