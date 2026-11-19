"use client";
import View from "../../shared/components/AdminAccountManagement";
import AdminGuard from "./AdminGuard";
import AdminDataState from "./AdminDataState";
import AdminActionFeedback from "./AdminActionFeedback";

export default function AdminAccountManagementAdapter(props) {
  return <View {...props} AdminGuard={AdminGuard} AdminDataState={AdminDataState} AdminActionFeedback={AdminActionFeedback} />;
}
