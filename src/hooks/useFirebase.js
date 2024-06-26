import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { useEffect, useState } from "react";
import initializeFirebase from "../features/FirebaseAuth/Firebase.init";
import { serverBaseURL } from "../utility/getURL";

// initialize firebase app
initializeFirebase();

const useFirebase = () => {
  const [user, setUser] = useState({});
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // const [admin, setAdmin] = useState(false);
  const auth = getAuth();

  // register new user
  const registerUser = (email, password, name, navigate) => {
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then((user) => {
        // console.log(user);
        // console.log(user.user);
        sendEmailVerification(user.user).then(() => {
          // email verification sent
        });
        // registration successfull.

        setAuthError("");
        // change displayName
        const newUser = { email, displayName: name };
        setUser(newUser);

        // save user to db
        saveUserToDB(email, name, "POST");

        // send name to firebase
        updateProfile(auth.currentUser, {
          displayName: name,
        })
          .then(() => {
            // Profile updated!
          })
          .catch(() => {
            // An error occurred
          });
        navigate("/");
        // ...
      })
      .catch((error) => {
        setAuthError(error.message);
      })
      .finally(() => setIsLoading(false));
  };

  // logIn User
  const logInUser = (email, password, location, navigate) => {
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(() =>
        // user
        {
          navigate("/");
          setAuthError("");
        }
      )
      .catch((error) => {
        setAuthError(error.message);
      })
      .finally(() => setIsLoading(false));
  };

  // Google Sign In
  const signInWithGoogle = (location, navigate) => {
    setIsLoading(true);
    const googleProvider = new GoogleAuthProvider();
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const user = result.user;
        // save to db
        saveUserToDB(user.email, user.displayName, "PUT");
        setAuthError("");
        const destination = location?.state?.from || "/";
        navigate(destination);
      })
      .catch((error) => {
        setAuthError(error.message);
      })
      .finally(() => setIsLoading(false));
  };

  // Observe user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // user is signed out
        setUser({});
      }
      setIsLoading(false);
    });
    return () => unsubscribe;
  }, [auth]);

  /* useEffect(() => {
        fetch(`${import.meta.env.VITE_SERVER_URL}/api/users/${user.email}`)
            .then(res => res.json())
            .then(data => setAdmin(data.admin))
    }, [user.email]); */

  // User Log Out
  const logout = () => {
    setIsLoading(true);
    signOut(auth)
      .then(() => {
        // Sign-out successful
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  // send user data to database
  const saveUserToDB = (email, displayName, method) => {
    const user = { email, displayName };
    fetch(`${serverBaseURL}/api/users`, {
      method: method,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(user),
    }).then();
  };

  // Reset password
  const resetPass = (email) => {
    setIsLoading(true);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Password reset email sent!
        // ..
      })
      .catch(() => {
        // const errorCode = error.code;
        // const errorMessage = error.message;
        // ..
      })
      .finally(() => setIsLoading(false));
  };

  return {
    // admin,
    user,
    registerUser,
    logInUser,
    signInWithGoogle,
    logout,
    isLoading,
    authError,
    resetPass,
  };
};

export default useFirebase;
