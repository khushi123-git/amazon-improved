import { useEffect, useState } from "react";
import supabase from "./supabaseClient";

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) console.error(error);
      else setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Supabase + React</h1>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
