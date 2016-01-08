define(["sulucontent/components/content/preview/main"],function(a){"use strict";return{tabOptions:{noTitle:!0},layout:function(){return{extendExisting:!0,content:{width:this.options.preview?"fixed":"max",rightSpace:!1,leftSpace:!1}}},template:"",saved:!0,animateTemplateDropdown:!1,initialize:function(){this.sandbox.emit("husky.toolbar.header.item.enable","template",!1),this.preview=new a,this.dfdListenForResourceLocator=$.Deferred(),this.add=!0,this.load()},bindCustomEvents:function(){this.sandbox.on("sulu.dropdown.template.item-clicked",function(a){this.animateTemplateDropdown=!0,this.checkRenderTemplate(a)},this),this.sandbox.on("sulu.toolbar.save",function(a){this.submit(a)},this)},initializeResourceLocator:function(){this.startListening=!1,this.getDomElementsForTagName("sulu.rlp",function(a){var b=a.$el.data("element");b&&""!==b.getValue()&&void 0!==b.getValue()&&null!==b.getValue()||(this.startListening=!0)}.bind(this)),this.add||this.startListening?this.sandbox.dom.one(this.getDomElementsForTagName("sulu.rlp.part"),"focusout",this.setResourceLocator.bind(this)):this.dfdListenForResourceLocator.resolve()},load:function(){this.sandbox.emit("sulu.content.contents.get-data",this.render.bind(this))},render:function(a){this.bindCustomEvents(),this.listenForChange(),this.data=a,this.data.id&&(this.add=!1),this.data.template?this.checkRenderTemplate(this.data.template):this.checkRenderTemplate()},checkRenderTemplate:function(a){return"string"==typeof a&&(a={template:a}),a&&this.template===a.template?void this.sandbox.emit("sulu.header.toolbar.item.enable","template",!1):(this.sandbox.emit("sulu.header.toolbar.item.loading","template"),void(""===this.template||this.saved?this.loadFormTemplate(a):this.showRenderTemplateDialog(a)))},showRenderTemplateDialog:function(a){this.sandbox.emit("sulu.overlay.show-warning","sulu.overlay.be-careful","content.template.dialog.content",function(){this.sandbox.emit("sulu.header.toolbar.item.enable","template",!1),this.template&&this.sandbox.emit("sulu.header.toolbar.item.change","template",this.template)}.bind(this),function(){this.loadFormTemplate(a)}.bind(this))},loadFormTemplate:function(a){var b,c;a&&(this.template=a.template),this.formId="#content-form-container",this.$container=this.sandbox.dom.createElement('<div id="content-form-container"/>'),this.html(this.$container),this.sandbox.form.getObject(this.formId)&&(b=this.data,this.data=this.sandbox.form.getData(this.formId),b.id&&(this.data.id=b.id),this.data=this.sandbox.util.extend({},b,this.data)),c=this.getTemplateUrl(a),require([c],function(a){this.renderFormTemplate(a)}.bind(this))},renderFormTemplate:function(a){var b={translate:this.sandbox.translate,content:this.data,options:this.options},c=this.sandbox.util.extend({},b),d=this.sandbox.util.template(a,c);this.sandbox.dom.html(this.formId,d),this.setStateDropdown(this.data),this.propertyConfiguration={},this.createForm(this.data).then(function(){this.initializeResourceLocator(),this.changeTemplateDropdownHandler()}.bind(this))},createForm:function(a){var b=this.sandbox.form.create(this.formId),c=this.sandbox.data.deferred();return b.initialized.then(function(){this.createConfiguration(this.formId),this.setFormData(a).then(function(){this.sandbox.start(this.$el,{reset:!0}),this.initSortableBlock(),this.bindFormEvents(),setTimeout(function(){var a=this.sandbox.form.getData(this.formId);this.sandbox.emit("sulu.preview.initialize",a,!0)}.bind(this),10),c.resolve()}.bind(this))}.bind(this)),c.promise()},createConfiguration:function(a){var b=this.sandbox.dom.find("*[data-property]",a);this.sandbox.dom.each(b,function(a,b){var c=this.sandbox.dom.data(b,"property");c.$el=this.sandbox.dom.$(b),this.sandbox.dom.data(b,"property",null),this.sandbox.dom.removeAttr(b,"data-property",null),this.sandbox.util.foreach(c.tags,function(a){this.propertyConfiguration[a.name]?(this.propertyConfiguration[a.name].properties[a.priority]?this.propertyConfiguration[a.name].properties[a.priority].push(c):this.propertyConfiguration[a.name].properties[a.priority]=[c],this.propertyConfiguration[a.name].highestPriority<a.priority&&(this.propertyConfiguration[a.name].highestProperty=c,this.propertyConfiguration[a.name].highestPriority=a.priority),this.propertyConfiguration[a.name].lowestPriority>a.priority&&(this.propertyConfiguration[a.name].lowestProperty=c,this.propertyConfiguration[a.name].lowestPriority=a.priority)):(this.propertyConfiguration[a.name]={properties:{},highestProperty:c,highestPriority:a.priority,lowestProperty:c,lowestPriority:a.priority},this.propertyConfiguration[a.name].properties[a.priority]=[c])}.bind(this))}.bind(this))},initSortableBlock:function(){var a,b=this.sandbox.dom.find(".sortable",this.$el);b&&b.length>0&&(this.sandbox.dom.sortable(b,"destroy"),a=this.sandbox.dom.sortable(b,{handle:".move",forcePlaceholderSize:!0}),this.sandbox.dom.unbind(a,"sortupdate"),a.bind("sortupdate",function(a){var b=this.sandbox.form.getData(this.formId),c=this.sandbox.dom.data(a.currentTarget,"mapperProperty");this.sandbox.emit("sulu.preview.update-property",c,b[c]),this.sandbox.emit("sulu.content.changed")}.bind(this)))},bindFormEvents:function(){this.sandbox.dom.on(this.formId,"form-remove",function(a,b){var c=this.sandbox.form.getData(this.formId);this.initSortableBlock(),this.sandbox.emit("sulu.preview.update-property",b,c[b]),this.setHeaderBar(!1)}.bind(this)),this.sandbox.dom.on(this.formId,"form-add",function(a,b,c,d){this.createConfiguration(a.currentTarget);var e,f=this.sandbox.dom.children(this.$find('[data-mapper-property="'+b+'"]')),g=void 0!==d&&f.length>d?f[d]:this.sandbox.dom.last(f);this.sandbox.start(g);try{e=this.sandbox.form.getData(this.formId),this.sandbox.emit("sulu.preview.update-property",b,e[b])}catch(h){}this.initSortableBlock()}.bind(this)),this.sandbox.dom.on(this.formId,"init-sortable",function(a){this.initSortableBlock()}.bind(this))},setFormData:function(a){var b=this.sandbox.form.setData(this.formId,a),c="title";return!a.id||""!==a[c]&&"undefined"!=typeof a[c]&&null!==a[c]||this.sandbox.util.load("/admin/api/nodes/"+a.id+"?webspace="+this.options.webspace+"&language="+this.options.language+"&complete=false&ghost-content=true").then(function(a){a.type&&this.sandbox.dom.attr("#title","placeholder",a.type.value+": "+a[c])}.bind(this)),this.sandbox.dom.attr("#show-in-navigation","checked",a.navigation),b},getDomElementsForTagName:function(a,b){var c,d=$();if(this.propertyConfiguration.hasOwnProperty(a))for(c in this.propertyConfiguration[a].properties)this.propertyConfiguration[a].properties.hasOwnProperty(c)&&this.sandbox.util.foreach(this.propertyConfiguration[a].properties[c],function(a){$.merge(d,a.$el),b&&b(a)});return d},getTemplateUrl:function(a){var b="text!/admin/content/template/form";return b+=a?"/"+a.template+".html":".html",b+="?webspace="+this.options.webspace+"&language="+this.options.language,this.data.id&&(b+="&uuid="+this.data.id),b},setHeaderBar:function(a){this.sandbox.emit("sulu.content.contents.set-header-bar",a),this.saved=a},setStateDropdown:function(a){this.sandbox.emit("sulu.content.contents.set-state",a)},setResourceLocator:function(){if("pending"===this.dfdListenForResourceLocator.state()){var a={},b=!0;this.getDomElementsForTagName("sulu.rlp.part",function(c){var d,e=c.$el.data("element").getValue();""!==e?(d=this.preview.getSequence(c.$el,this.sandbox),d&&(a[d]=e)):b=!1}.bind(this)),b?(this.startListening=!0,this.sandbox.emit("sulu.content.contents.get-rl",a,function(a){this.getDomElementsForTagName("sulu.rlp",function(b){var c=b.$el.data("element");(""===c.getValue()||void 0===c.getValue()||null===c.getValue())&&c.setValue(a)}.bind(this)),this.dfdListenForResourceLocator.resolve(),this.setHeaderBar(!1)}.bind(this))):this.sandbox.dom.one(this.getDomElementsForTagName("sulu.rlp.part"),"focusout",this.setResourceLocator.bind(this))}},listenForChange:function(){this.sandbox.dom.on(this.$el,"keyup change",_.debounce(function(){this.setHeaderBar(!1)}.bind(this),10),".trigger-save-button"),this.sandbox.on("sulu.content.changed",function(){this.setHeaderBar(!1)}.bind(this))},changeTemplateDropdownHandler:function(){this.template&&this.sandbox.emit("sulu.header.toolbar.item.change","template",this.template),this.sandbox.emit("sulu.header.toolbar.item.enable","template",this.animateTemplateDropdown),this.animateTemplateDropdown=!1,this.add&&(this.dfdListenForResourceLocator=$.Deferred())},submit:function(a){this.sandbox.emit("sulu.header.toolbar.item.loading","save"),this.dfdListenForResourceLocator.then(function(){if(this.sandbox.form.validate(this.formId)){var b=this.sandbox.form.getData(this.formId);b.navigation=this.sandbox.dom.prop("#show-in-navigation","checked"),this.options.data=this.sandbox.util.extend(!0,{},this.options.data,b),this.sandbox.emit("sulu.content.contents.save",b,a)}}.bind(this))}}});