"use client";
import React, { useEffect, useState } from "react";
import ProjectHeader from "./_shared/ProjectHeader";
import SettingsSection from "./_shared/SettingsSection";
import { useParams } from "next/navigation";
import axios from "axios";
import { ProjectType, ScreenConfig } from "@/type/types";
import { Loader2Icon } from "lucide-react";

function ProjectCanvasPlayground() {
  const { projectId } = useParams();
  const [projectDetail, setProjectDetail] = useState<ProjectType>();
  const [screenConfig, setScreenConfig] = useState<ScreenConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Loading");

  useEffect(() => {
    projectId && GetProjectDetail();
  }, [projectId]);

  const GetProjectDetail = async () => {
    // Fetch project details from API or state
    setLoading(true);
    setLoadingMsg("Loading...");
    const result = await axios.get("/api/project?projectId=" + projectId);
    console.log(result.data);
    setProjectDetail(result?.data?.projectDetail);
    setScreenConfig(result?.data?.screenConfig);
    // if (result.data.screenConfig?.length == 0) {
    //   generateScreenConfig();
    // }
    setLoading(false);
  };

  useEffect(() => {
    if (projectDetail && screenConfig && screenConfig.length == 0) {
      generateScreenConfig();
    }
  }, [projectDetail && screenConfig]);

  const generateScreenConfig = async () => {
    setLoading(true);
    setLoadingMsg("Generating screen config...");
    const result = await axios.post("/api/generate-config", {
      projectId: projectId,
      deviceType: projectDetail?.device,
      userInput: projectDetail?.userInput,
    });
    console.log(result.data);
    GetProjectDetail();
    setLoading(false);
  };

  return (
    <div>
      <ProjectHeader />
      <div>
        {loading && (
          <div className="p-3 absolute bg-blue-300/20 border-blue-400 border rounded-xl left-1/2 top-20">
            <h2 className="flex gap-2 items-center">
              <Loader2Icon className="animate-spin" />
              {loadingMsg}
            </h2>
          </div>
        )}
        {/* settings */}
        <SettingsSection projectDetail={projectDetail} />
        {/* canvass */}
      </div>
    </div>
  );
}

export default ProjectCanvasPlayground;
