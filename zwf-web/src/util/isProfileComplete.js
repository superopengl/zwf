export const isProfileComplete = (user) => {
  return user.profile.givenName && user.profile.surname && user.profile.country && user.profile.locale;
}

