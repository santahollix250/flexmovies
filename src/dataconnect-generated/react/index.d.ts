import { CreateUserData, GetPublicMovieListData, AddMovieToListData, AddMovieToListVariables, GetMyWatchListData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;

export function useGetPublicMovieList(options?: useDataConnectQueryOptions<GetPublicMovieListData>): UseDataConnectQueryResult<GetPublicMovieListData, undefined>;
export function useGetPublicMovieList(dc: DataConnect, options?: useDataConnectQueryOptions<GetPublicMovieListData>): UseDataConnectQueryResult<GetPublicMovieListData, undefined>;

export function useAddMovieToList(options?: useDataConnectMutationOptions<AddMovieToListData, FirebaseError, AddMovieToListVariables>): UseDataConnectMutationResult<AddMovieToListData, AddMovieToListVariables>;
export function useAddMovieToList(dc: DataConnect, options?: useDataConnectMutationOptions<AddMovieToListData, FirebaseError, AddMovieToListVariables>): UseDataConnectMutationResult<AddMovieToListData, AddMovieToListVariables>;

export function useGetMyWatchList(options?: useDataConnectQueryOptions<GetMyWatchListData>): UseDataConnectQueryResult<GetMyWatchListData, undefined>;
export function useGetMyWatchList(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyWatchListData>): UseDataConnectQueryResult<GetMyWatchListData, undefined>;
