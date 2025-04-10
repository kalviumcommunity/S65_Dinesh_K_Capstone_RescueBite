{/* If item is from an organization, show organization info */}
{item.organization && (
  <div className="mt-4">
    <h3 className="text-lg font-semibold">Organization</h3>
    <Link 
      to={`/organizations/${item.organization}`}
      className="text-blue-600 hover:underline flex items-center mt-1"
    >
      <Building2 className="h-4 w-4 mr-1" />
      {item.organizationDetails?.name || "View Organization Profile"}
    </Link>
  </div>
)} 