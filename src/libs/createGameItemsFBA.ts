import * as path from "path";
import { DatIndexes } from "../interfaces/DatIndexes";
import { getRomFilter } from "./getRomFilter";
import { DriverStatus } from "../interfaces/DriverStatus";
import { createGameItem } from "./createGameItem";
import { Category } from "../interfaces/Category";
import { GameItem } from "../interfaces/GameItem";

interface SubGroup {
  name: string;
  manufacturers: Array<string>;
}

const subGroups: Array<SubGroup> = [
  {
    name: "Capcom",
    manufacturers: ["Capcom"],
  },
  {
    name: "SNK",
    manufacturers: ["SNK", "Playmore"],
  },
  {
    name: "IGS",
    manufacturers: ["IGS"],
  },

  {
    name: "Sexy",
    manufacturers: [
      "Hi-max",
      "Playmark",
      "Comad",
      "Daigom",
      "Promat",
      "Yun Sung",
      "Yanyaka",
      "Barko Corp",
    ],
  },

  {
    name: "Classic",
    manufacturers: ["U.S. Games", "IDSA"],
  },

  // {
  //   name: "Midway",
  //   manufacturers: ["Midway"],
  // },
  // {
  //   name: "Konami",
  //   manufacturers: ["Konami"],
  // },
  // {
  //   name: "Namco",
  //   manufacturers: ["Namco"],
  // },
  // {
  //   name: "Sega",
  //   manufacturers: ["Sega"],
  // },
  // {
  //   name: "Taito",
  //   manufacturers: ["Taito"],
  // },

  // {
  //   name: "Data East",
  //   manufacturers: ["Data East"],
  // },

  // {
  //   name: "Psikyo",
  //   manufacturers: ["Psikyo"],
  // },

  // {
  //   name: "Jaleco",
  //   manufacturers: ["Jaleco"],
  // },
  // {
  //   name: "Irem",
  //   manufacturers: ["Irem"],
  // },

  // {
  //   name: "Toaplan",
  //   manufacturers: ["Toaplan"],
  // },

  // {
  //   name: "Technos",
  //   manufacturers: ["Technos"],
  // },

  // {
  //   name: "Tecmo",
  //   manufacturers: ["Tecmo"],
  // },

  // {
  //   name: "Sammy",
  //   manufacturers: ["Sammy"],
  // },

  // {
  //   name: "Mitchell",
  //   manufacturers: ["Mitchell"],
  // },
];

export const createGameItemsFBA = (
  category: Category,
  files: Array<string>,
  datIndexes: DatIndexes
): Array<GameItem> => {
  let items: Array<GameItem> = [];
  const { romsPath } = category;
  const includeStatus = getRomFilter(category, "includeStatus") as Array<
    DriverStatus
  >;

  files.map((romPath: string) => {
    const romName = path.basename(romPath);

    if (datIndexes.hasOwnProperty(romName)) {
      const romPath = path.resolve(romsPath, romName);
      const index = datIndexes[romName];

      let shouldExport = true;
      if (includeStatus) {
        if (!includeStatus.includes(index.driverStatus as DriverStatus)) {
          shouldExport = false;
        }
      }

      if (shouldExport) {
        if (getRomFilter(category, "excludeDemo")) {
          const matchs = index.gameName.match(/\WDemo\W/gi);
          if (matchs) {
            shouldExport = false;
          }
        }
      }

      if (shouldExport) {
        if (getRomFilter(category, "excludeHomebrew")) {
          const matchs = index.gameName.match(/homebrew/gi);
          if (matchs) {
            shouldExport = false;
          }
        }
      }

      if (shouldExport) {
        let subCategoryName = "";

        if (subCategoryName == "") {
          if (Number(index.year) <= 1984 || index.year == "198?") {
            subCategoryName = "Classic";
          }
        }

        if (subCategoryName == "") {
          if (
            index.gameName.match(/hack|bootleg/gi) ||
            index.manufacturer.match(/hack|bootleg/gi)
          ) {
            subCategoryName = "Hack and Bootleg";
          }
        }

        if (subCategoryName == "") {
          for (let i = 0; i < subGroups.length; i++) {
            const subGroup = subGroups[i];
            for (let j = 0; j < subGroup.manufacturers.length; j++) {
              const pattern = subGroup.manufacturers[j];
              // console.log(pattern, index.manufacturer, index.manufacturer.match(new RegExp(pattern, "gi")) )
              if (index.manufacturer.match(new RegExp(pattern, "gi"))) {
                subCategoryName = subGroup.name;
                break;
              }
            }
            if (subCategoryName != "") {
              break;
            }
          }
        }

        if (subCategoryName == "") {
          subCategoryName = "Misc";
        }

        const item = createGameItem(romPath, index.gameName, subCategoryName);
        items.push(item);
      }
    }
  });

  return items;
};
