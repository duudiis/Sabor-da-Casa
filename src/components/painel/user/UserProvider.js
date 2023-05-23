import { useEffect, useState } from "react";

import UserContext from "@/components/painel/user/UserContext";

import User from "@/models/User";

import me from "@/lib/auth/me";
import logout from "@/lib/auth/logout";

const UserProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const fetchUser = async () => {

    const response = await me();

    if (response.status === 200) {

      setUser(new User(response.user));

    } else if (response.status === 401) {

      logout(document).then(() => { window.location.href = "/login"; });

    } else {

      alert(response.message ?? "Erro desconhecido.");

    };

  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;