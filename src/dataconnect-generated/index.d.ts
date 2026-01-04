import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddMovieToListData {
  movieListEntry_insert: MovieListEntry_Key;
}

export interface AddMovieToListVariables {
  movieListId: UUIDString;
  movieId: UUIDString;
  positionInList: number;
}

export interface CreateUserData {
  user_insert: User_Key;
}

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

export interface GetPublicMovieListData {
  movieLists: ({
    id: UUIDString;
    name: string;
    description?: string | null;
  } & MovieList_Key)[];
}

export interface MovieListEntry_Key {
  movieListId: UUIDString;
  movieId: UUIDString;
  __typename?: 'MovieListEntry_Key';
}

export interface MovieList_Key {
  id: UUIDString;
  __typename?: 'MovieList_Key';
}

export interface Movie_Key {
  id: UUIDString;
  __typename?: 'Movie_Key';
}

export interface Review_Key {
  id: UUIDString;
  __typename?: 'Review_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface WatchEntry_Key {
  id: UUIDString;
  __typename?: 'WatchEntry_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface GetPublicMovieListRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetPublicMovieListData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetPublicMovieListData, undefined>;
  operationName: string;
}
export const getPublicMovieListRef: GetPublicMovieListRef;

export function getPublicMovieList(): QueryPromise<GetPublicMovieListData, undefined>;
export function getPublicMovieList(dc: DataConnect): QueryPromise<GetPublicMovieListData, undefined>;

interface AddMovieToListRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddMovieToListVariables): MutationRef<AddMovieToListData, AddMovieToListVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddMovieToListVariables): MutationRef<AddMovieToListData, AddMovieToListVariables>;
  operationName: string;
}
export const addMovieToListRef: AddMovieToListRef;

export function addMovieToList(vars: AddMovieToListVariables): MutationPromise<AddMovieToListData, AddMovieToListVariables>;
export function addMovieToList(dc: DataConnect, vars: AddMovieToListVariables): MutationPromise<AddMovieToListData, AddMovieToListVariables>;

interface GetMyWatchListRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyWatchListData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyWatchListData, undefined>;
  operationName: string;
}
export const getMyWatchListRef: GetMyWatchListRef;

export function getMyWatchList(): QueryPromise<GetMyWatchListData, undefined>;
export function getMyWatchList(dc: DataConnect): QueryPromise<GetMyWatchListData, undefined>;

