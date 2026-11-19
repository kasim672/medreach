"use client";
import View from "../../../../shared/components/ProviderAccounts";
import AdminGuard from "../../../components/AdminGuard";
import AdminDataState from "../../../components/AdminDataState";
import AdminActionFeedback from "../../../components/AdminActionFeedback";

export default function ProviderAccountsAdapter() {
  return <View AdminGuard={AdminGuard} AdminDataState={AdminDataState} AdminActionFeedback={AdminActionFeedback} />;
}
