import AdminLayoutWrapper from "../applayout/AdminLayoutWrapper";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminLayoutWrapper showHeaderFooter={true}>
        {children}
      </AdminLayoutWrapper>
    </>
  );
} 