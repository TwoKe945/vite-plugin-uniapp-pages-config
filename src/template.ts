export const constantTemplate= `
export const <%=constantName%> = {
   <% for(let i = 0; i < Object.keys(constants).length; i++) {
       var key = Object.keys(constants)[i]
   %>
   /**
    * <%=constants[key].style.navigationBarTitleText %>
    */
   <%=key%>: "/<%=constants[key].path%>"<% if(i < Object.keys(constants).length - 1) {%>,
   <%}%><%}%>
};`

export const declarationTemplate = `declare module '<%=virtualModuleName%>' {
    export const <%=constantName%>: {<% for(let i = 0; i < Object.keys(constants).length; i++) { var key = Object.keys(constants)[i]%>
       // <%=constants[key].style.navigationBarTitleText %>
       <%=key%>: "/<%=constants[key].path%>"<% if(i < Object.keys(constants).length - 1) {%>,<%}%><%}%>
    };
}`