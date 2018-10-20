const rp = require('request-promise');
const request = require('request');

 /**
 * @name resource_set
 * @api public
 */
resource_set(accessToken, id) {
  let token = accessToken;
  if (token instanceof TokenSet) {
    if (!token.access_token) {
      return Promise.reject(new Error('access_token not present in TokenSet'));
    }
    token = token.access_token;
  }
  let httpOptions = { headers: { Authorization: bearer(token) } };
  const issuer = this.issuer;
  let path;
  if (typeof id == "undefined") {
    path = issuer.resource_registration_endpoint;
  } else {
    path = issuer.resource_registration_endpoint + "/" + id;
  }
  return this.httpClient.get(path, issuer.httpOptions(httpOptions))
  .then((response) => {
    return response.body;
  })
  .catch(errorHandler.bind(this));
}

/**
* @name permission
* @api public
*/
permission(accessToken, resourceInfo) {

  let token = accessToken;
  if (token instanceof TokenSet) {
    if (!token.access_token) {
      return Promise.reject(new Error('access_token not present in TokenSet'));
    }
    token = token.access_token;
  }

  const headers = { 'Content-Type': 'application/json' };
  headers.Authorization = bearer(token);
  const issuer = this.issuer;
  return this.httpClient.post(issuer.permission_endpoint, issuer.httpOptions({
    headers,
    body: JSON.stringify(resourceInfo),
  }))
    .then(response => response.body)
    .catch(errorHandler.bind(this));
}

/**
* @name umaToken
* @api public
*/
getUmaTokenOld(umaTicket) {
  let promise;
  const tokenCall = () => this.tokenGrant({
    grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
    ticket: umaTicket,
  });

  if (promise) {
    promise = promise.then(tokenCall);
  } else {
    return tokenCall();
  }

  return promise;
}

getUmaToken(umaTicket) {
  const issuer = this.issuer;
  const options = {
    url: issuer.token_endpoint,
    method: 'POST',
    auth: {
      user: this.client_id,
      password: this.client_secret
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',

    },
    form: {
      'ticket': umaTicket,
      'grant_type': 'urn:ietf:params:oauth:grant-type:uma-ticket'
    }

  };
  return rp(options, function(err, res, body) {
      console.log('Request accepted, data received');
  })
  .then(res => { return res; })
  .catch(body => { return body; })
  .catch(errorHandler.bind(this));

}

/**
* @name umaToken
* @api public
*/
introspectUMA(accessToken, rpt) {
  let promise;

  let token = accessToken;
  if (token instanceof TokenSet) {
    if (!token.access_token) {
      return Promise.reject(new Error('access_token not present in TokenSet'));
    }
    token = token.access_token;
  }

  const issuer = this.issuer;

  const options = {
    url: issuer.rpt_endpoint,
    method: 'POST',
    headers: {
      'Authorization': bearer(token),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {token: rpt}
  };
  return rp(options, function(err, res, body) {
    console.log('Request accepted, data received');
  })
    .then(body => { return body; })
    .catch(errorHandler.bind(this));
}

/**
 * @name umaToken
 * @api public
 */
registerResource(accessToken, resource) {
  let promise;

  let token = accessToken;
  if (token instanceof TokenSet) {
    if (!token.access_token) {
      return Promise.reject(new Error('access_token not present in TokenSet'));
    }
    token = token.access_token;
  }

  const headers = { 'Content-Type': 'application/json' };
  headers.Authorization = bearer(token);
  const issuer = this.issuer;
  return this.httpClient.post(issuer.resource_registration_endpoint, issuer.httpOptions({
    headers,
    body: resource
  }))
    .then(response => response.body)
    .catch(errorHandler.bind(this));
  }

/**
 * @name umaToken
 * @api public
 */
deleteResource(accessToken, resourceId) {
  let token = accessToken;
  if (token instanceof TokenSet) {
    if (!token.access_token) {
      return Promise.reject(new Error('access_token not present in TokenSet'));
    }
    token = token.access_token;
  }
  let httpOptions = { headers: { Authorization: bearer(token) } };
  const issuer = this.issuer;
  let path;
  if (typeof resourceId == "undefined") {
    path = issuer.resource_registration_endpoint;
  } else {
    path = issuer.resource_registration_endpoint + "/" + resource;
  }
  return this.httpClient.delete(path, issuer.httpOptions(httpOptions))
  .then(expectResponse(200))
  .then((response) => {
    return response.body;
  })
  .catch(errorHandler.bind(this));
}


tokenGrant(body) {
  return this.authenticatedPost('token', { body: _.omitBy(body, _.isUndefined) })
    .then(response => (JSON.parse(response.body)));
}

introGrant(options) {
  return this.authenticatedPost('rpt', this.issuer.httpOptions(options))
    .then(response => (JSON.parse(response.body)));
}
