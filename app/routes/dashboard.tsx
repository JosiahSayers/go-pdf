import { AppShell } from "@mantine/core";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Header from "~/components/dashbaord/header";

export async function loader() {
  return json({ user: { name: "John Smith" } });
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <AppShell fixed={false} padding="3rem" header={<Header user={user} />}>
      <Outlet />
    </AppShell>
  );
}
