import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'movie-stream-frontend',
  location: 'us-east4'
};

export const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';

export function createUser(dc) {
  return executeMutation(createUserRef(dc));
}

export const getPublicMovieListRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPublicMovieList');
}
getPublicMovieListRef.operationName = 'GetPublicMovieList';

export function getPublicMovieList(dc) {
  return executeQuery(getPublicMovieListRef(dc));
}

export const addMovieToListRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddMovieToList', inputVars);
}
addMovieToListRef.operationName = 'AddMovieToList';

export function addMovieToList(dcOrVars, vars) {
  return executeMutation(addMovieToListRef(dcOrVars, vars));
}

export const getMyWatchListRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyWatchList');
}
getMyWatchListRef.operationName = 'GetMyWatchList';

export function getMyWatchList(dc) {
  return executeQuery(getMyWatchListRef(dc));
}

