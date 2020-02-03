import fs from "fs";
import parse from "csv-parse";
import { ParserType } from "./Parser";
import readXmlAsJs from "../libs/readXmlAsJs";
import { Platform, getPlatformOptions, DriverStatus } from "../libs/AppConfig";

export interface DatIndex {
  id: string;
  gameName: string;
  sourcefile?: string;
  driverStatus?: string;
  diskName?: string;
  year?: string;
}

export interface DatIndexes {
  [key: string]: DatIndex;
}

interface DatParsers {
  [key: string]: (props: DatParsersProps) => DatIndexes;
}

interface DatParsersProps {
  platform: Platform;
  indexes: DatIndexes;
}

const datParsers: DatParsers = {
  [ParserType.noIntro3ds]: (props: DatParsersProps) => {
    const { platform, indexes } = props;
    const datPath = getPlatformOptions(platform, "datPath") as string;
    const js = readXmlAsJs(datPath);
    js.datafile.game.map(game => {
      if (game.hasOwnProperty("game_id")) {
        const attrs = game._attributes;
        const { name } = attrs;
        const isbios = name.startsWith("[BIOS]");
        if (!isbios) {
          const id = game.game_id._text;
          const gameName = name;
          indexes[id] = {
            id,
            gameName
          };
        }
      }
    });
    return indexes;
  },
  [ParserType.noPayStationPsvTsv]: (props: DatParsersProps) => {
    const { platform, indexes } = props;
    const datPath = getPlatformOptions(platform, "datPath") as string;
    const txt = fs.readFileSync(datPath, "utf8");
    const parser = parse(txt, {
      delimiter: "	",
      skip_empty_lines: true
    });
    let record: any;
    while ((record = parser.read())) {
      const id = record[0];
      // const region = record[1];
      const gameName = record[2];
      indexes[id] = {
        id,
        gameName
      };
    }
    return indexes;
  },
  [ParserType.fba]: (props: DatParsersProps) => {
    const { platform, indexes } = props;
    const datPath = getPlatformOptions(platform, "datPath") as string;
    const exportStatus = getPlatformOptions(platform, "exportStatus") as Array<
      DriverStatus
    >;
    const exportYear = getPlatformOptions(platform, "exportYear") as number;

    const js = readXmlAsJs(datPath);
    const games = js.datafile.game;
    const { length } = games;
    for (let i = 0; i < length; i++) {
      const game = games[i];
      const attrs = game._attributes;
      const { name, isbios } = attrs;

      if (isbios) {
        continue;
      }

      if (!game.hasOwnProperty("driver")) {
        continue;
      }

      if (exportStatus) {
        const driverStatus = game.driver._attributes.status;
        if (!exportStatus.includes(driverStatus)) {
          continue;
        }
      }

      if (!isNaN(exportYear)) {
        const year = Number(game.year._text.substr(0, 4));
        if (year < exportYear) {
          continue;
        }
      }

      const id = name + ".zip";
      const gameName = game.description._text;
      indexes[id] = {
        id,
        gameName
      };
    }
    return indexes;
  },

  [ParserType.mame]: (props: DatParsersProps) => {
    const { platform, indexes } = props;
    const datPath = getPlatformOptions(platform, "datPath") as string;
    const excludeRomOfs = getPlatformOptions(
      platform,
      "excludeRomOfs"
    ) as Array<string>;
    const includeRomOfs = getPlatformOptions(
      platform,
      "includeRomOfs"
    ) as Array<string>;

    const js = readXmlAsJs(datPath);
    const games = js.datafile.machine;
    const { length } = games;
    for (let i = 0; i < length; i++) {
      const game = games[i];
      const attrs = game._attributes;
      const { name, isbios, isdevice, romof, sourcefile } = attrs;
      if (isdevice || isbios) {
        continue;
      }
      if (excludeRomOfs && excludeRomOfs.length) {
        if (excludeRomOfs.includes(romof)) {
          continue;
        }
      }

      if (includeRomOfs && includeRomOfs.length) {
        if (!includeRomOfs.includes(romof)) {
          continue;
        }
      }

      let diskName = "";
      if (game.hasOwnProperty("disk")) {
        const disk = game.disk;
        if (disk.hasOwnProperty("_attributes")) {
          const diskAttrs = game.disk._attributes;
          if (diskAttrs.hasOwnProperty("name")) {
            diskName = diskAttrs.name;
            // console.log(label, "|", name, "|", diskName);
          }
        }
      }
      if (game.hasOwnProperty("driver")) {
        const driverStatus = game.driver._attributes.status;
        const gameName = game.description._text;
        const id = name + ".zip";
        const year = game.year._text.substr(0, 4);
        indexes[id] = {
          id,
          gameName,
          sourcefile,
          driverStatus,
          diskName,
          year
        };
      }
    }

    return indexes;
  }
};

export default datParsers;
