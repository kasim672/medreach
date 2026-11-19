"use client";
import ResourceDirectoryView from "../../shared/components/ResourceDirectory";
import AmbulanceBookingModal from "./AmbulanceBookingModal";

export default function ResourceDirectory(props) {
  return <ResourceDirectoryView {...props} AmbulanceBookingModal={AmbulanceBookingModal} />;
}
