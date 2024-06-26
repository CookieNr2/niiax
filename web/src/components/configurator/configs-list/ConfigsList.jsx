import "./configs-list.css";
import { useEffect, useState } from "react";
import {
  getConfigs,
  getPopularConfigs,
  getAllPopularConfigs,
  deleteConfig,
} from "../../../services/api.services";
import ConfigRender from "../config-render/Config-render";
import { useNavigate, useLocation } from "react-router-dom";

function ConfigsList({ reload, onTemplateButtonClick }) {
  const [configs, setConfigs] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const isProfileConfigurations = location.pathname.startsWith("/profile");
  const inspirationPage = location.pathname === "/inspiration";

  useEffect(() => {
    async function fetchData() {
      try {
        let fetchedConfigs;
        if (isProfileConfigurations) {
          fetchedConfigs = await getConfigs();
        } else if (inspirationPage) {
          fetchedConfigs = await getAllPopularConfigs();
        } else {
          fetchedConfigs = await getPopularConfigs();
        }
        setConfigs(fetchedConfigs.data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [reload, isProfileConfigurations]);

  const handleTemplateButtonClick = (config) => {
    navigate("/configurator", { state: { config } });
  };

  const handleDeleteConfig = async (configId) => {
    try {
      await deleteConfig(configId);
      setConfigs(configs.filter((config) => config._id !== configId));
    } catch (error) {
      console.error("Error deleting config:", error);
    }
  };

  return (
    <div className="configs-list">
      {configs.map((config, index) => {
        const configRenderFormat = {
          index,
          body: { color: config.body },
          joyControllerLeft: { color: config.joyControllerLeft },
          joyControllerRight: { color: config.joyControllerRight },
          thumbSticks: { color: config.thumbSticks },
          abxy: { color: config.abxy },
          dpad: { color: config.dpad },
          utils: { color: config.utils },
        };
        return (
          <div key={index} data-bs-theme="dark">
            {isProfileConfigurations && (
              <a type="button" onClick={() => handleDeleteConfig(config._id)}>
                <i className="bi bi-dash-circle"></i>
              </a>
            )}
            <ConfigRender configStatus={configRenderFormat} isDisplay={true} />
            <button
              type="button"
              className="btn btn-link link-light text-decoration-none"
              onClick={() => handleTemplateButtonClick(config)}
            >
              {isProfileConfigurations
                ? "Edit my configuration"
                : "Use as a template"}{" "}
              <i className="mx-1 bi bi-chevron-right"></i>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ConfigsList;
