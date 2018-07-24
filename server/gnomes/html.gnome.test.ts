import { IHandleAndName } from '@ilion/models/user.model";
import { link, linkUser, projectDescription, projectOpens, oBlock } from "../gnomes/html.gnome";
import { YollerInfoDto } from '@ilion/models/yoller-info";

test("link html", () => {
   expect(link("Click here!", "foobar")).toBe("<strong><a style='color: #376676; text-decoration: none' href='https://ilion-test.herokuapp.com/foobar' target='_blank'>Click here!</a></strong>");
});

test("link user html", () => {
   let user: IHandleAndName = {
      handle: "jonathan_strange",
      alias: "Jonathan Strange"
   }
   expect(linkUser(user)).toBe("<strong><a style='color: #376676; text-decoration: none' href='https://ilion-test.herokuapp.com/jonathan_strange' target='_blank'>Jonathan Strange</a></strong>");
});

test("project description", () => {
   let p = {
      description: `<div style='color: red;'>Kalamazoo</div>`
   } as YollerInfoDto;
   expect(projectDescription(p)).toBe(`<div style='display: block; width: 80%; margin: auto; margin-bottom: 10px;'><div style='color: red;'>Kalamazoo</div></div>`);
});

test("project opening date", () => {
   let p = {
      title: "Jonathan Strange and Mr. Norrell",
      occurrences: [
         {
            local_time: "2018-09-15T21:30:00"
         }
      ]
   } as YollerInfoDto;
   expect(projectOpens(p)).toBe(`<div><em>Jonathan Strange and Mr. Norrell</em> opens <strong>September 15th</strong> at <strong>9:30 pm</strong>.</div>`);
});

let XyZ = null;

test("oBlock html", () => {
   let p = {
      id: 33,
      title: "Jonathan Strange and Mr. Norrell",
      occurrences: [
         {
            id: 9009,
            local_time: "2018-09-15T21:30:00"
         }
      ]
   } as YollerInfoDto;
   expect(oBlock(p.id, p.occurrences[0])).toBe(`<strong><a style='color: #376676; text-decoration: none' href='https://ilion-test.herokuapp.com/i/project/33/rsvp/9009' target='_blank'>
      <div style='height: 60px; width: 60px; border-radius: 3px; border: 2px solid #376676; display: inline-block; text-align: center; 
         color: #376676; margin-right: 5px; margin-top: 10px;'>
         <strong style='display: inline-block; padding: 8px 5px 2px;'>
            Sat
         </strong>
         <strong style='display: inline-block; padding: 0px 5px;'>
            9:30 pm
         </strong>
      </div></a></strong>`);
});