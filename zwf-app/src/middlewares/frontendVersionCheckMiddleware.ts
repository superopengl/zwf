
export const frontendVersionCheckMiddleware = async (req, res, next) => {
  
  const frontendVersion = req.headers['zwf-webapp-version'];
  const beckendVersion = process.env.GIT_HASH;

  res.header('zwf-bff-version', beckendVersion);
  if(frontendVersion && frontendVersion !== beckendVersion) {
    res.sendStatus(409); // 409 Conflict
    return;
  }

  next();
};

