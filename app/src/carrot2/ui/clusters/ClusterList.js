import React from "react";

import "./ClusterList.css";

import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdjust, faAlignCenter } from "@fortawesome/free-solid-svg-icons";
import { view } from "@risingstack/react-easy-state";

import { clusterStore } from "../../store/services.js";
import { clusterSelectionStore } from "../../store/selection.js";

function TopCluster(props) {
  const cluster = props.cluster;
  const subclusters = cluster.clusters || [];
  const hasSubclusters = subclusters.length > 0;

  const meta =
    `(${cluster.size} docs` +
    (hasSubclusters ? `, ${subclusters.length} subclusters)` : ")");
  const labels = cluster.labels.join(", ");

  const clusterSelectionStore = props.clusterSelectionStore;
  const className = classNames("TopCluster", {
    "with-subclusters": hasSubclusters,
    selected: clusterSelectionStore.isSelected(cluster)
  });

  return (
    <div
      className={className}
      onClick={() => clusterSelectionStore.toggleSelection(cluster)}
    >
      <FontAwesomeIcon className="icon" icon={faAlignCenter} />
      <span className="labels">{labels}</span>{" "}
      <span className="meta">{meta}</span>
      <div className="subclusters">
        {subclusters.map(subcluster => (
          <SubClusterView
            key={subcluster.id}
            cluster={subcluster}
            clusterSelectionStore={clusterSelectionStore}
          />
        ))}
      </div>
    </div>
  );
}

const TopClusterView = view(TopCluster);

function SubCluster(props) {
  const cluster = props.cluster;
  const labels = cluster.labels.join(", ");
  const meta = `(${cluster.size})`;
  const metaTitle = `(${cluster.size} docs)`;
  const clusterSelectionStore = props.clusterSelectionStore;

  const className = classNames("SubCluster", {
    selected: clusterSelectionStore.isSelected(cluster)
  });

  return (
    <span
      className={className}
      onClick={e => {
        e.stopPropagation();
        clusterSelectionStore.toggleSelection(cluster);
      }}
    >
      <span className="icon">
        <FontAwesomeIcon icon={faAdjust} />
        {"\u00a0"}
      </span>
      <span className="labels">{labels}</span>
      {"\u00a0"}
      <span className="meta" title={metaTitle}>
        {meta}
      </span>{" "}
    </span>
  );
}

const SubClusterView = view(SubCluster);

export const ClusterList = () => {
  const clusters = clusterStore.clusters;
  const flatClusters = clusters.reduce((flat, c) => {
    return flat && (!c.clusters || c.clusters.length === 0);
  }, true);

  return (
    <div className={"ClusterList" + (flatClusters ? " flat" : "")}>
      <div>
        {clusters.length > 0 ? (
          clusters.map(cluster => (
            <TopClusterView
              cluster={cluster}
              key={cluster.id}
              clusterSelectionStore={clusterSelectionStore}
            />
          ))
        ) : (
          <div>No clusters to show</div>
        )}
      </div>
    </div>
  );
};
