import Link from "next/link";

const recorded = (value) => typeof value === "string" ? value.trim() : "";

export default function HospitalDirectoryCard({ hospital }) {
  const coordinates = hospital.location?.coordinates || [];
  const [longitude, latitude] = coordinates;
  const canNavigate = coordinates.length === 2 && Number.isFinite(longitude) && Number.isFinite(latitude)
    && Math.abs(longitude) <= 180 && Math.abs(latitude) <= 90 && (longitude !== 0 || latitude !== 0);
  const address = recorded(hospital.address) || [hospital.locality, hospital.city].map(recorded).filter(Boolean).join(", ");
  const hours = recorded(hospital.operatingHours) || recorded(hospital.hours);
  const services = [...new Map([hospital.specialties, hospital.departments, hospital.services]
    .flatMap((values) => Array.isArray(values) ? values : [])
    .map(recorded).filter(Boolean).map((value) => [value.toLowerCase(), value])).values()];
  const id = hospital._id || hospital.id || hospital.slug;
  const detailsUrl = hospital.slug && `/hospitals/${encodeURIComponent(hospital.slug)}`;

  return (
    <article className="surface parity-stack parity-full-height parity-break-text">
      <h2 className="parity-heading-5 parity-mb-2">
        {detailsUrl ? <Link href={detailsUrl}>{hospital.name}</Link> : hospital.name}
      </h2>
      <p className="parity-muted parity-mb-2">{address || "Address not recorded"}</p>
      {recorded(hospital.hospitalType) && <p className="parity-mb-2">{hospital.hospitalType} hospital</p>}
      <p className="parity-mb-2">
        {services.length ? `${services.slice(0, 4).join(" · ")}${services.length > 4 ? ` · +${services.length - 4} more` : ""}` : "Specialties and services not recorded"}
      </p>
      <p className="parity-muted parity-mb-3">{hours ? `Hours: ${hours}` : "Hours not recorded"}</p>
      <div className="parity-flex parity-wrap parity-gap-2 parity-mt-auto">
        {id && <Link className="parity-action parity-action-primary parity-action-small" href={`/requests/new?hospital=${encodeURIComponent(id)}&flow=standard`}>Request beds</Link>}
        {canNavigate && <a className="parity-action parity-action-outline parity-action-small" href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`} target="_blank" rel="noopener noreferrer">Navigate</a>}
        {detailsUrl && <Link className="parity-action parity-action-outline parity-action-small" href={detailsUrl}>Details</Link>}
      </div>
    </article>
  );
}
