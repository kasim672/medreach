"use client";
import ProviderWorkspace from "../../../shared/components/ProviderWorkspace";
import AdminDataState from "../../components/AdminDataState";
import AdminActionFeedback from "../../components/AdminActionFeedback";
import StaffBedRequest from "../../components/StaffBedRequest";

export default function ProviderPage() {
  return <ProviderWorkspace AdminDataState={AdminDataState} AdminActionFeedback={AdminActionFeedback} StaffBedRequest={StaffBedRequest} />;
}
