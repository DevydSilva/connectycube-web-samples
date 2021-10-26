import CryptoJS from "crypto-js";
import ConnectyCube from "connectycube";

class AuthService {
  arr = [];
  constructor() {
    this.init();
  }

  logout = () => {
    ConnectyCube.destroySession();
  };

  init = () => {
    const credentials = {
      appId: process.env.REACT_APP_CONNECTYCUBE_APP_ID,
      authKey: process.env.REACT_APP_CONNECTYCUBE_APP_AUTH_KEY,
      authSecret: process.env.REACT_APP_CONNECTYCUBE_APP_SECRET,
    };

    const appConfig = {
      debug: {
        mode: 1,
        conference: {
          server: process.env.REACT_APP_CONNECTYCUBE_MULTIPARTY_SERVER_ENDPOINT,
        },
      },
      endpoints: {
        api: process.env.REACT_APP_CONNECTYCUBE_API_ENDPOINT,
      },
    };
    ConnectyCube.init(credentials, appConfig);
  };
  login(userName, roomID) {
    return new Promise((resolve, reject) => {
      ConnectyCube.createSession()
        .then((session) => {
          if (!userName) {
            ConnectyCube.destroySession().catch((error) => {});
          } else if (localStorage.getItem("userName") === userName) {
            const userCredentials = {
              login: localStorage.getItem("userLogin"),
              password: localStorage.getItem("userPass"),
            };
            ConnectyCube.login(userCredentials)
              .then((user) => {
                resolve(user);

                //CallService.createAndJoinMeeting(user)
              })
              .catch((error) => {
                console.log(error);
                reject();
              });
          } else {
            const rug = require("random-username-generator");
            const new_username = rug.generate();
            const userProfile = {
              login: new_username,
              password: CryptoJS.MD5(new_username).toString(),
              full_name: userName,
            };
            ConnectyCube.users
              .signup(userProfile)
              .then((user) => {
                localStorage.setItem("userName", userName);
                localStorage.setItem("userPass", userProfile.password);
                localStorage.setItem("userLogin", userProfile.login);
                const userCredentials = {
                  login: localStorage.getItem("userLogin"),
                  password: localStorage.getItem("userPass"),
                };
                ConnectyCube.login(userCredentials)
                  .then((user) => {
                    resolve(user, session);
                  })
                  .catch((error) => {});
              })
              .catch((error) => {});
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }
}
const Auth = new AuthService();
export default Auth;