// Copyright 2021 HITCON Online Contributors
// SPDX-License-Identifier: BSD-2-Clause

function getGidRange(gidRange, gid) {
  let result = undefined;
  for (const r of gidRange) {
    if (r.firstgid > gid) {
      return result;
    }
    result = r;
  }
  return result;
}

function mapGid(gid, childMaps, tilesetDirectory, resultLayerMap, mapName, layerName, idx) {
  if (layerName === 'wall') return gid;
  if (layerName === 'jitsi') return gid;
  if (layerName === 'iframe') return gid;
  if (layerName === 'portal') return gid;

  const r = getGidRange(childMaps[mapName].gidRange, gid);
  if (typeof r === 'undefined') return null;
  const cell = tilesetDirectory[r.name].prefix + (gid-(r.firstgid));

  if (!(cell in resultLayerMap)) {
    return null;
  }

  return cell;
}

function fetchTextLayer(targetLayer, startIdx, endIdx, mapName, layerName) {
  let result = [];
  for (let idx = startIdx; idx < endIdx; idx++) result.push(idx);

  if (targetLayer === undefined) {
    // no text layer here.
    console.warn(`No text layer ${layerName} in ${mapName}`);
    return result.map((idx) => null);
  }

  result = result.map((idx) => {
    const data = targetLayer.layers.filter((l) => {
      return typeof l.data[idx] === "number" && l.data[idx] !== 0
    }).map((l) => {
      return l.name;
    });
    if (data.length === 0) {
      // No jitsi here.
      return null;
    }
    if (data.length !== 1) {
      console.warn(`Multiple text layer ${layerName} value on ${mapName} - ${idx}`, data);
    }
    return data[0];
  });
  return result;
}

function combineSingleLayer(childMaps, layerName, tilesetDirectory, resultLayerMap, base) {
  const worldWidth = 200;
  const worldHeight = 100;
  const mapWidth = 40;
  const mapHeight = 50;
  const combinedLayer = [];

  // map01 ~ 05
  for (let row = 0; row < mapHeight; row++) {
    const startIdx = mapWidth * row;
    const endIdx = (mapWidth * row) + mapWidth;
    for (let idx = 1; idx < 6; idx++) {
      const mapName = `${base}-0${idx}`;
      const targetLayer = childMaps[mapName].layers
        .filter((layer) => layer.name.toLowerCase() === layerName)[0];

      let data;
      if (layerName === 'jitsi' || layerName === 'iframe' || layerName === 'portal') data = fetchTextLayer(targetLayer, startIdx, endIdx, mapName, layerName);
      else data = targetLayer.data.slice(startIdx, endIdx);

      const mappedData = data.map((gid, idx) => {
        return mapGid(gid, childMaps, tilesetDirectory, resultLayerMap, mapName, layerName, idx);
      });
      combinedLayer.push(...mappedData);
    }
  }

  // map06 ~ 10
  for (let row = 0; row < mapHeight; row++) {
    const startIdx = mapWidth * row;
    const endIdx = (mapWidth * row) + mapWidth;
    for (let idx = 6; idx < 11; idx++) {
      const numStr = idx < 10 ? `0${idx}` : idx;
      const mapName = `${base}-${numStr}`;
      const targetLayer = childMaps[mapName].layers
        .filter((layer) => layer.name.toLowerCase() === layerName)[0];

      let data;
      if (layerName === 'jitsi' || layerName === 'iframe' || layerName === 'portal') data = fetchTextLayer(targetLayer, startIdx, endIdx, mapName, layerName);
      else data = targetLayer.data.slice(startIdx, endIdx);

      const mappedData = data.map((gid, idx) => {
        return mapGid(gid, childMaps, tilesetDirectory, resultLayerMap, mapName, layerName, idx);
      });
      combinedLayer.push(...mappedData);
    }
  }
  const adjLayer = combinedLayer.map((gid) => {
    return gid;
  });
  return adjLayer;
}

export {combineSingleLayer, getGidRange};
