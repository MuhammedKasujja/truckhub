"use client";

import { ServiceGroup } from "@/features/services/types";
import { ListIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceTable } from "./service-table";
import { ServiceList } from "./service-list";
import React, { Activity } from "react";
import { Can } from "@/components/has-permission";
import Link from "next/link";
import { PageTitle, PageHeader, PageAction } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";

type ServiceListWrapperProps = {
  services: ServiceGroup[];
};

export function ServiceListWrapper({ services }: ServiceListWrapperProps) {
  const [view, setView] = React.useState<"table" | "list">("list");
  const serviceList = React.useMemo(() => {
    return services.flatMap((ele) => ele.services);
  }, [services]);

  return (
    <div className="space-y-4">
      <PageHeader className="pb-0">
        <PageTitle>
          Services <Badge variant={"outline"}>{serviceList.length}</Badge>
        </PageTitle>
        <PageAction className="gap-5">
          <Can permission={"services:create"}>
            <Button asChild>
              <Link href={"/services/new"}>
                <PlusIcon />
              </Link>
            </Button>
          </Can>
          <Button
            type="button"
            size={"icon"}
            onClick={() =>
              setView((prev) => (prev === "list" ? "table" : "list"))
            }
          >
            <ListIcon />
          </Button>
        </PageAction>
      </PageHeader>
      <Activity mode={view === "table" ? "visible" : "hidden"}>
        <ServiceTable services={services} />
      </Activity>
      <Activity mode={view === "list" ? "visible" : "hidden"}>
        <ServiceList services={services} />
      </Activity>
    </div>
  );
}
