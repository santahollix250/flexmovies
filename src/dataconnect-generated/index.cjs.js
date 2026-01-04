const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'movie-stream-frontend',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dc) {
  return executeMutation(createUserRef(dc));
};

const getPublicMovieListRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPublicMovieList');
}
getPublicMovieListRef.operationName = 'GetPublicMovieList';
exports.getPublicMovieListRef = getPublicMovieListRef;

exports.getPublicMovieList = function getPublicMovieList(dc) {
  return executeQuery(getPublicMovieListRef(dc));
};

const addMovieToListRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddMovieToList', inputVars);
}
addMovieToListRef.operationName = 'AddMovieToList';
exports.addMovieToListRef = addMovieToListRef;

exports.addMovieToList = function addMovieToList(dcOrVars, vars) {
  return executeMutation(addMovieToListRef(dcOrVars, vars));
};

const getMyWatchListRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyWatchList');
}
getMyWatchListRef.operationName = 'GetMyWatchList';
exports.getMyWatchListRef = getMyWatchListRef;

exports.getMyWatchList = function getMyWatchList(dc) {
  return executeQuery(getMyWatchListRef(dc));
};
