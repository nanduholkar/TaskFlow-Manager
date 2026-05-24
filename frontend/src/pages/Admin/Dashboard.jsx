import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import InfoCard from "../../components/Cards/InfoCard.jsx";

import { useUserAuth } from "../../hooks/useUserAuth.jsx";
import { UserContext } from "../../context/UserContext.jsx";

import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { addThousandsSeparator } from "../../utils/helper.js";

import { LuArrowRight } from "react-icons/lu";

import TaskListTable from "../../components/layout/TaskListTable.jsx";
import CustomPieChart from "../../components/Charts/CustomPieChart.jsx";
import CustomBarChart from "../../components/Charts/CustomBarChart.jsx";

const COLORS = ["#8D51FF", "#00BBDB", "#7BCE00"];

const Dashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  // ---------------- PREPARE CHART DATA ----------------
  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || {};
    const taskPriorityLevels = data?.taskPriorityLevels || {};

    // Pie Chart Data
    const distributionData = [
      {
        status: "Pending",
        count: taskDistribution?.pending || 0,
      },
      {
        status: "In Progress",
        count: taskDistribution?.["in-progress"] || 0,
      },
      {
        status: "Completed",
        count: taskDistribution?.completed || 0,
      },
    ];

    setPieChartData(distributionData);

    // Bar Chart Data
    const priorityLevelData = [
      {
        priority: "Low",
        count: taskPriorityLevels?.low || 0,
      },
      {
        priority: "Medium",
        count: taskPriorityLevels?.medium || 0,
      },
      {
        priority: "High",
        count: taskPriorityLevels?.high || 0,
      },
    ];

    setBarChartData(priorityLevelData);
  };

  // ---------------- API CALL ----------------
  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_DASHBOARD_DATA
      );

      if (response.data) {
        setDashboardData(response.data);

        prepareChartData(response.data?.charts || {});
      }
    } catch (error) {
      console.log("Error fetching dashboard data:", error);
    }
  };

  // ---------------- NAVIGATION ----------------
  const onSeeMore = () => {
    navigate("/admin/tasks");
  };

  // ---------------- USE EFFECT ----------------
  useEffect(() => {
    getDashboardData();
  }, []);

  // ---------------- UI ----------------
  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 space-y-6">

        {/* HEADER + STATS */}
        <div className="card p-5">
          <h2 className="text-xl md:text-2xl font-semibold">
            Good Morning! {user?.name}
          </h2>

          <p className="text-xs md:text-[13px] text-gray-400 mt-1.5 mb-5">
            {moment().format("dddd Do MMM YYYY")}
          </p>

          {/* STATS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">

            <InfoCard
              label="Total Tasks"
              value={addThousandsSeparator(
                dashboardData?.charts?.taskDistribution?.all || 0
              )}
              color="bg-primary"
            />

            <InfoCard
              label="Pending Tasks"
              value={addThousandsSeparator(
                dashboardData?.charts?.taskDistribution?.pending || 0
              )}
              color="bg-violet-500"
            />

            <InfoCard
              label="In Progress Tasks"
              value={addThousandsSeparator(
                dashboardData?.charts?.taskDistribution?.["in-progress"] || 0
              )}
              color="bg-cyan-500"
            />

            <InfoCard
              label="Completed Tasks"
              value={addThousandsSeparator(
                dashboardData?.charts?.taskDistribution?.completed || 0
              )}
              color="bg-lime-500"
            />
          </div>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* PIE CHART */}
          <div className="card p-5">
            <h5 className="text-lg font-semibold mb-4">
              Task Distribution
            </h5>

            <CustomPieChart
              data={pieChartData}
              colors={COLORS}
            />
          </div>


          <div className="card p-5">
            <h5 className="text-lg font-semibold mb-4">
              Task Priority Levels
            </h5>

            <CustomBarChart
              data={barChartData}
              colors={COLORS}
            />
          </div>



        </div>



        {/* RECENT TASKS */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-lg font-semibold">
              Recent Tasks
            </h5>

            <button
              className="card-btn flex items-center gap-2"
              onClick={onSeeMore}
            >
              See All
              <LuArrowRight className="text-base" />
            </button>
          </div>

          <TaskListTable
            tableData={dashboardData?.recentTasks || []}
          />
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;