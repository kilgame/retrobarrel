import React from "react";
import { AppConfigState } from "../states/appConfigState";
import { Dispatch } from "redux";
import { ContextMenu, connectMenu } from "react-contextmenu";
import { ContextMenuId } from "./ContextMenuId";
import { remote } from "electron";
import { ComputedGameItem } from "../interfaces/ComputedGameItem";
import { googleSearch } from "../libs/googleSearch";
import { scanMissingThumbnails } from "../actions/scanMissingThumbnails";
import { createMenuItem } from "./createMenuItem";
import { setPlayerPicker } from "../actions/setPlayerPicker";
import { toggleFavour } from "../actions/toggleFavour";
import { mameGroups } from "../libs/mameGroups";
import * as path from "path";

declare global {
  interface Window {
    out: () => void;
  }
}

const id = ContextMenuId.GAME_ITEM;
let mameGroups2 = { ...mameGroups };

const GameItemContextMenu = (props: GameItemContextMenuProps) => {
  const { dispatch, appConfig, trigger } = props;

  const enabled = Boolean(trigger && trigger.item);

  const onPlay = () => {
    dispatch(setPlayerPicker(true));
  };

  const onToggleFavour = () => {
    dispatch(toggleFavour(trigger.item));
  };

  const onOpen = () => {
    remote.shell.openItem(trigger.item.romPath);
  };
  const onShow = () => {
    remote.shell.showItemInFolder(trigger.item.romPath);
  };
  const onDownloadThumbnail = () => {
    dispatch(scanMissingThumbnails([trigger.item], appConfig));
  };
  const onGoogleSearch = () => {
    googleSearch(appConfig, trigger.item);
  };

  const setToMameGroup = (category: string) => {
    const basename = path.basename(trigger.item.romPath);
    const ext = path.extname(basename);
    const noExt = basename.replace(ext, "");

    if (!mameGroups2.hasOwnProperty(category)){
      mameGroups2[category] = [];
    }

    if (!mameGroups2[category].hasOwnProperty(noExt)) {
      mameGroups2[category].push(noExt);
    }
    window.out = () => {
      console.log(JSON.stringify(mameGroups2));
    };
  };

  const onSetToAction = () => {
    setToMameGroup("Action");
  };
  const onSetToClassic = () => {
    setToMameGroup("Classic");
  };
  const onSetToFighting = () => {
    setToMameGroup("Fighting");
  };
  const onSetToGamble = () => {
    setToMameGroup("Gamble");
  };
  const onSetToMahJong = () => {
    setToMameGroup("MahJong");
  };
  const onSetToPuzzle = () => {
    setToMameGroup("Puzzle");
  };
  const onSetToQuiz = () => {
    setToMameGroup("Quiz");
  };
  const onSetToRacing = () => {
    setToMameGroup("Racing");
  };
  const onSetToShootingHorizontal= () => {
    setToMameGroup("Shooting (Horizontal)");
  };

  const onSetToShootingVertical= () => {
    setToMameGroup("Shooting (Vertical)");
  };

  const onSetToSport= () => {
    setToMameGroup("Sport");
  };




  return (
    <ContextMenu id={id}>
      {/* {createMenuItem("Play", onPlay, enabled)}
      {createMenuItem("Toggle favour", onToggleFavour, enabled)}
      {createMenuItem("Open rom", onOpen, enabled)}
      {createMenuItem("Show rom directory", onShow, enabled)}
      {createMenuItem("Download thumbnails", onDownloadThumbnail, enabled)} */}
      {createMenuItem("Google search image", onGoogleSearch, enabled)}

      {/* ----------------------------------------- */}
      {createMenuItem("set to Action", onSetToAction, enabled)}
      {createMenuItem("set to Classic", onSetToClassic, enabled)}
      {createMenuItem("set to Fighting", onSetToFighting, enabled)}
      {createMenuItem("set to Gamble", onSetToGamble, enabled)}
      {createMenuItem("set to MahJong", onSetToMahJong, enabled)}
      {createMenuItem("set to Puzzle", onSetToPuzzle, enabled)}
      {createMenuItem("set to Quiz", onSetToQuiz, enabled)}
      {createMenuItem("set to Racing", onSetToRacing, enabled)}
      {createMenuItem("set to Shooting Horizontal", onSetToShootingHorizontal, enabled)}
      {createMenuItem("set to Shooting Vertical", onSetToShootingVertical, enabled)}
      {createMenuItem("set to Sport", onSetToSport, enabled)}
    </ContextMenu>
  );
};

interface GameItemContextMenuProps {
  dispatch: Dispatch<any>;
  appConfig: AppConfigState;
  trigger: GameItemTriggerProps;
}

export interface GameItemTriggerProps {
  item: ComputedGameItem;
}

export default connectMenu(id)(GameItemContextMenu);
