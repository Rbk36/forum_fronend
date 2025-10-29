// import { createContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./App.css";
// import { axiosInstance } from "./utility/axios";
// import AppRouter from "./routes/AppRouter.jsx";

// export const UserState = createContext();

// function App() {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   const getUserData = async () => {
//     try {
//       const token = localStorage.getItem("Evangadi_Forum");
//       if (!token) {
//         navigate("/auth");
//         return;
//       }

//       const response = await axiosInstance.get("/user/check", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const userData = response.data;
//       console.log("Fetched user data:", userData);
//       setUser(userData);
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//       // Log more detail
//       if (error.response) {
//         console.error(
//           "Response error:",
//           error.response.data,
//           error.response.status
//         );
//       } else if (error.request) {
//         console.error("No response, request:", error.request);
//       } else {
//         console.error("Axios error message:", error.message);
//       }

//       navigate("/auth");
//     }
//   };

//   useEffect(() => {
//     getUserData();
//   }, []);

//   return (
//     <UserState.Provider value={{ user, setUser }}>
//       <AppRouter />
//     </UserState.Provider>
//   );
// }

// export default App;
// // src/components/AIAnswer/AIAnswer.js
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "./utility/axios";
import AppRouter from "./routes/AppRouter.jsx";

export const UserState = createContext();

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const getUserData = async () => {
    try {
      const token = localStorage.getItem("Evangadi_Forum");
      if (!token) {
        navigate("/auth");
        return;
      }

      const response = await axiosInstance.get("/user/check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      navigate("/auth");
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <UserState.Provider value={{ user, setUser }}>
      <AppRouter />
    </UserState.Provider>
  );
}

export default App;
