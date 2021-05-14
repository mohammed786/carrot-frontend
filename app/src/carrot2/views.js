import React from "react";

import { faAdn, faQuinscape } from "@fortawesome/free-brands-svg-icons";

import { autoEffect, store, view } from "@risingstack/react-easy-state";
import { Lazy } from "@carrotsearch/ui/Lazy.js";
import { persistentStore } from "@carrotsearch/ui/store/persistent-store.js";

import { PieChartHints } from "./ui/clusters/PieChartHints.js";
import { TreemapHints } from "./ui/clusters/TreemapHints.js";
import { VisualizationExport } from "./ui/clusters/VisualizationExport.js";

import { ResultListConfig } from "./ui/results/ResultListConfig.js";
import { ClusterList } from "./ui/clusters/ClusterList.js";
import { PieChartConfig } from "./ui/clusters/PieChartConfig.js";
import { TreemapConfig } from "./ui/clusters/TreemapConfig.js";

import { ResultList } from "./ui/results/ResultList.js";
import { clusterStore, searchResultStore } from "./store/services.js";
import {
  clusterSelectionStore,
  documentVisibilityStore
} from "./store/selection.js";

const ClusterListView = view(ClusterList);

const treemapConfigStore = persistentStore("treemapConfig", {
  layout: "relaxed",
  stacking: "hierarchical",
  includeResults: true
});

const pieChartConfigStore = persistentStore("pieChartConfig", {
  includeResults: true
});

// A mechanism for capturing the "loading" state of visualizations, which should include
// time spent on initializing the view for new data (which may take a while in case of FoamTree).
const createImplRef = () => {
  // A reactive store for the visualization loading state.
  const loading = store({ loading: false });

  // Called when the visualization is initialized.
  const setRef = newRef => {
    ref.current = newRef;

    // Clear loading state when rollout starts.
    newRef.set("onRolloutStart", () => (loading.loading = false));
  };

  const ref = {
    current: undefined,
    setCurrent: setRef,

    // This reactive method will be called by the "Loading" overlay to see
    // if the overlay should show.
    isLoading: () => loading.loading
  };

  // Set loading state when there is a non-empty list of clusters to display.
  autoEffect(() => {
    if (clusterStore.clusters.length > 0) {
      loading.loading = true;
    }
  });
  return ref;
};

const treemapImplRef = createImplRef();
const piechartImplRef = createImplRef();

const treemapLoader = () => {
  return import(
    /* webpackChunkName: "treemap" */
    /* webpackPrefetch: true */
    "./ui/clusters/Treemap.js"
  ).then(module => view(module.Treemap));
};

const piechartLoader = () => {
  return import(
    /* webpackChunkName: "piechart" */
    /* webpackPrefetch: true */
    "./ui/clusters/PieChart.js"
  ).then(module => view(module.PieChart));
};

// TODO: convert to a series of some internal API calls?
export const clusterViews = [
  {
    label: "Clusters",
    views: {
      folders: {
        label: "list",
        createContentElement: props => {
          return <ClusterListView {...props} />;
        },
        tools: []
      },

      treemap: {
        label: "treemap",
        isLoading: treemapImplRef.isLoading,
        createContentElement: visible => {
          const treemapProps = {
            visible: visible,
            configStore: treemapConfigStore,
            implRef: treemapImplRef
          };
          return <Lazy loader={treemapLoader} props={treemapProps} />;
        },
        tools: [
          {
            id: "interaction",
            icon: faQuinscape,
            createContentElement: props => {
              return <TreemapHints />;
            },
            title: "Treemap interaction help"
          },
          {
            id: "export-image",
            createContentElement: props => {
              return (
                <VisualizationExport
                  implRef={treemapImplRef}
                  fileNameSuffix="treemap"
                />
              );
            },
            title: "Export treemap as JPEG"
          },
          {
            id: "config",
            icon: faAdn,
            createContentElement: props => {
              return <TreemapConfig store={treemapConfigStore} />;
            },
            title: "Treemap settings"
          }
        ]
      },

      "pie-chart": {
        label: "pie-chart",
        isLoading: piechartImplRef.isLoading,
        createContentElement: visible => {
          const piechartProps = {
            visible: visible,
            configStore: pieChartConfigStore,
            implRef: piechartImplRef
          };
          return <Lazy loader={piechartLoader} props={piechartProps} />;
        },
        tools: [
          {
            id: "interaction",
            icon: faQuinscape,
            createContentElement: props => {
              return <PieChartHints />;
            }
          },
          {
            id: "export-image",
            createContentElement: props => {
              return (
                <VisualizationExport
                  implRef={piechartImplRef}
                  fileNameSuffix="pie-chart"
                />
              );
            },
            title: "Export pie-chart as JPEG"
          },
          {
            id: "config",
            icon: faAdn,
            createContentElement: props => {
              return <PieChartConfig store={pieChartConfigStore} />;
            }
          }
        ]
      }
    }
  }
];

export const resultsViews = [
  {
    label: "Results",
    views: {
      list: {
        label: "list",
        createContentElement: props => {
          return (
            <ResultList
              {...props}
              store={searchResultStore}
              visibilityStore={documentVisibilityStore}
              clusterSelectionStore={clusterSelectionStore}
            />
          );
        },
        tools: [
          {
            id: "config",
            icon: faAdn,
            createContentElement: props => {
              return (
                <ResultListConfig>
                  {props.source.createConfig()}
                </ResultListConfig>
              );
            }
          }
        ]
      }
    }
  }
];
