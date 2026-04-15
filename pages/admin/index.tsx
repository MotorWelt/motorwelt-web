// pages/admin/index.tsx
import { GetServerSideProps } from "next";

export default function AdminIndexPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookies = req.headers.cookie || "";

  const getCookieValue = (name: string) => {
    const match = cookies.match(
      new RegExp(`(?:^|; )${name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : "";
  };

  const role = getCookieValue("mw_role");
  const email = getCookieValue("mw_email");
  const name = getCookieValue("mw_name");

  const isLogged =
    Boolean(role) && Boolean(email) && Boolean(name);

  if (!isLogged) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  const destination =
    role === "admin" || role === "editor"
      ? "/admin/perfil"
      : "/admin/perfil-equipo";

  return {
    redirect: {
      destination,
      permanent: false,
    },
  };
};