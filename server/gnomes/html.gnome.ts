import * as moment from "moment-timezone";

import { IHandleAndName } from "@ilion/models/user.model";
import YStrings from "../strings";
import { YollerInfoDto, OccurrenceInfoDto } from "@ilion/models/yoller-info";

export const link = (text: string, path: string) =>
{
   return `<strong><a style='color: #376676; text-decoration: none' href='${YStrings.RETURN_HOST + path}' target='_blank'>${text}</a></strong>`;
}

export const linkUser = (user: IHandleAndName) =>
{
   return link(user.alias, user.handle);
};

export const projectDescription = (project: YollerInfoDto) => {
   if (project.description)
   {
      return `<div style='display: block; width: 80%; margin: auto; margin-bottom: 10px;'>${project.description}</div>`;
   }
   else {
      return "";
   }
};

export const projectOpens = (project: YollerInfoDto) => {
   if (project.occurrences[0])
   {
      let m = moment(project.occurrences[0].local_time);
      return `<div><em>${project.title}</em> opens <strong>${m.format("MMMM Do")}</strong> at <strong>${m.format("h:mm a")}</strong>.</div>`;
   }
   else {
      return "";
   }
};

export const oBlock = (projectID: number, o: OccurrenceInfoDto) => {
   let m = moment(o.local_time);

   return link(`
      <div style='height: 60px; width: 60px; border-radius: 3px; border: 2px solid #376676; display: inline-block; text-align: center; 
         color: #376676; margin-right: 5px; margin-top: 10px;'>
         <strong style='display: inline-block; padding: 8px 5px 2px;'>
            ${m.format("ddd")}
         </strong>
         <strong style='display: inline-block; padding: 0px 5px;'>
            ${m.format("h:mm a")}
         </strong>
      </div>`, "i/project/" + projectID + "/rsvp/" + o.id);
};