var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text$1(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text$1(' ');
    }
    function empty() {
        return text$1('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* svelte/Sidebar.svelte generated by Svelte v3.12.1 */

    const file = "svelte/Sidebar.svelte";

    const get_content_slot_changes = () => ({});
    const get_content_slot_context = () => ({});

    const get_top_content_slot_changes = () => ({});
    const get_top_content_slot_context = () => ({});

    const get_sidebar_slot_changes = () => ({});
    const get_sidebar_slot_context = () => ({});

    const get_sidebar_heading_slot_changes = () => ({});
    const get_sidebar_heading_slot_context = () => ({});

    function create_fragment(ctx) {
    	var div6, div2, div0, t1, div1, t2, div5, nav, button, span, t3, div3, t5, div4, current, dispose;

    	const sidebar_heading_slot_template = ctx.$$slots["sidebar-heading"];
    	const sidebar_heading_slot = create_slot(sidebar_heading_slot_template, ctx, get_sidebar_heading_slot_context);

    	const sidebar_slot_template = ctx.$$slots.sidebar;
    	const sidebar_slot = create_slot(sidebar_slot_template, ctx, get_sidebar_slot_context);

    	const top_content_slot_template = ctx.$$slots["top-content"];
    	const top_content_slot = create_slot(top_content_slot_template, ctx, get_top_content_slot_context);

    	const content_slot_template = ctx.$$slots.content;
    	const content_slot = create_slot(content_slot_template, ctx, get_content_slot_context);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");

    			if (!sidebar_heading_slot) {
    				div0 = element("div");
    				div0.textContent = "Welcome!";
    			}

    			if (sidebar_heading_slot) sidebar_heading_slot.c();
    			t1 = space();
    			div1 = element("div");

    			if (sidebar_slot) sidebar_slot.c();
    			t2 = space();
    			div5 = element("div");
    			nav = element("nav");
    			button = element("button");
    			span = element("span");
    			t3 = space();

    			if (!top_content_slot) {
    				div3 = element("div");
    				div3.textContent = "Helloasdfs";
    			}

    			if (top_content_slot) top_content_slot.c();
    			t5 = space();
    			div4 = element("div");

    			if (content_slot) content_slot.c();
    			if (!sidebar_heading_slot) {
    				attr_dev(div0, "class", "sidebar-heading svelte-1daxrn4");
    				add_location(div0, file, 85, 6, 1797);
    			}

    			attr_dev(div1, "class", "list-group list-group-flush svelte-1daxrn4");
    			add_location(div1, file, 87, 4, 1857);
    			attr_dev(div2, "class", "bg-light border-right svelte-1daxrn4");
    			attr_dev(div2, "id", "sidebar-wrapper");
    			add_location(div2, file, 83, 2, 1700);
    			attr_dev(span, "class", "navbar-toggler-icon");
    			add_location(span, file, 95, 8, 2153);
    			attr_dev(button, "class", "navbar-toggler");
    			attr_dev(button, "id", "menu-toggle");
    			add_location(button, file, 94, 6, 2052);

    			if (!top_content_slot) {
    				attr_dev(div3, "class", "navbar-brand");
    				add_location(div3, file, 98, 8, 2246);
    			}

    			attr_dev(nav, "class", "navbar  navbar-light bg-light border-bottom");
    			add_location(nav, file, 93, 4, 1988);

    			attr_dev(div4, "class", "container-fluid");
    			add_location(div4, file, 101, 4, 2318);
    			attr_dev(div5, "id", "page-content-wrapper");
    			attr_dev(div5, "class", "svelte-1daxrn4");
    			add_location(div5, file, 92, 2, 1952);
    			attr_dev(div6, "class", "d-flex svelte-1daxrn4");
    			attr_dev(div6, "id", "wrapper");
    			toggle_class(div6, "toggled", ctx.menuActive);
    			add_location(div6, file, 82, 0, 1637);
    			dispose = listen_dev(button, "click", ctx.click_handler);
    		},

    		l: function claim(nodes) {
    			if (sidebar_heading_slot) sidebar_heading_slot.l(div2_nodes);

    			if (sidebar_slot) sidebar_slot.l(div1_nodes);

    			if (top_content_slot) top_content_slot.l(nav_nodes);

    			if (content_slot) content_slot.l(div4_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);

    			if (!sidebar_heading_slot) {
    				append_dev(div2, div0);
    			}

    			else {
    				sidebar_heading_slot.m(div2, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (sidebar_slot) {
    				sidebar_slot.m(div1, null);
    			}

    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, nav);
    			append_dev(nav, button);
    			append_dev(button, span);
    			append_dev(nav, t3);

    			if (!top_content_slot) {
    				append_dev(nav, div3);
    			}

    			else {
    				top_content_slot.m(nav, null);
    			}

    			append_dev(div5, t5);
    			append_dev(div5, div4);

    			if (content_slot) {
    				content_slot.m(div4, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (sidebar_heading_slot && sidebar_heading_slot.p && changed.$$scope) {
    				sidebar_heading_slot.p(
    					get_slot_changes(sidebar_heading_slot_template, ctx, changed, get_sidebar_heading_slot_changes),
    					get_slot_context(sidebar_heading_slot_template, ctx, get_sidebar_heading_slot_context)
    				);
    			}

    			if (sidebar_slot && sidebar_slot.p && changed.$$scope) {
    				sidebar_slot.p(
    					get_slot_changes(sidebar_slot_template, ctx, changed, get_sidebar_slot_changes),
    					get_slot_context(sidebar_slot_template, ctx, get_sidebar_slot_context)
    				);
    			}

    			if (top_content_slot && top_content_slot.p && changed.$$scope) {
    				top_content_slot.p(
    					get_slot_changes(top_content_slot_template, ctx, changed, get_top_content_slot_changes),
    					get_slot_context(top_content_slot_template, ctx, get_top_content_slot_context)
    				);
    			}

    			if (content_slot && content_slot.p && changed.$$scope) {
    				content_slot.p(
    					get_slot_changes(content_slot_template, ctx, changed, get_content_slot_changes),
    					get_slot_context(content_slot_template, ctx, get_content_slot_context)
    				);
    			}

    			if (changed.menuActive) {
    				toggle_class(div6, "toggled", ctx.menuActive);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar_heading_slot, local);
    			transition_in(sidebar_slot, local);
    			transition_in(top_content_slot, local);
    			transition_in(content_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(sidebar_heading_slot, local);
    			transition_out(sidebar_slot, local);
    			transition_out(top_content_slot, local);
    			transition_out(content_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div6);
    			}

    			if (sidebar_heading_slot) sidebar_heading_slot.d(detaching);

    			if (sidebar_slot) sidebar_slot.d(detaching);

    			if (top_content_slot) top_content_slot.d(detaching);

    			if (content_slot) content_slot.d(detaching);
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let menuActive = false;
      // list of items in accordian
      const Animals = [
        {
          name: "cat",
          display: "Meow!!",
        },
        {
          name: "dog",
          display: "Ruff Ruff!",
        },
        {
          name: "bird",
          display: "tweet tweet...",
        },
        {
          name: "Pig",
          display: "Oink Oink!!",
        },
      ];

      //current list item selection
      let selectionID;

      // opened Accordion
      let openedAccordion = 0;

    	let { $$slots = {}, $$scope } = $$props;

    	const click_handler = () => ($$invalidate('menuActive', menuActive = !menuActive));

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('menuActive' in $$props) $$invalidate('menuActive', menuActive = $$props.menuActive);
    		if ('selectionID' in $$props) $$invalidate('selectionID', selectionID = $$props.selectionID);
    		if ('openedAccordion' in $$props) openedAccordion = $$props.openedAccordion;
    		if ('selection' in $$props) selection = $$props.selection;
    	};

    	let selection;

    	$$self.$$.update = ($$dirty = { selectionID: 1 }) => {
    		if ($$dirty.selectionID) { selection = selectionID ? Animals.find((item) => item.name == selectionID).display : ""; }
    	};

    	return {
    		menuActive,
    		click_handler,
    		$$slots,
    		$$scope
    	};
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Sidebar", options, id: create_fragment.name });
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.12.1 */
    const {
    	Error: Error_1,
    	Object: Object_1,
    	console: console_1
    } = globals;

    // (209:0) {:else}
    function create_else_block(ctx) {
    	var switch_instance_anchor, current;

    	var switch_instance_spread_levels = [
    		ctx.props
    	];

    	var switch_value = ctx.component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};
    		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", ctx.routeEvent_handler_1);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = (changed.props) ? get_spread_update(switch_instance_spread_levels, [
    									get_spread_object(ctx.props)
    								]) : {};

    			if (switch_value !== (switch_value = ctx.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", ctx.routeEvent_handler_1);

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(209:0) {:else}", ctx });
    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block(ctx) {
    	var switch_instance_anchor, current;

    	var switch_instance_spread_levels = [
    		{ params: ctx.componentParams },
    		ctx.props
    	];

    	var switch_value = ctx.component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};
    		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", ctx.routeEvent_handler);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = (changed.componentParams || changed.props) ? get_spread_update(switch_instance_spread_levels, [
    									(changed.componentParams) && { params: ctx.componentParams },
    			(changed.props) && get_spread_object(ctx.props)
    								]) : {};

    			if (switch_value !== (switch_value = ctx.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", ctx.routeEvent_handler);

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(202:0) {#if componentParams}", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.componentParams) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    const hashPosition = window.location.href.indexOf('#/');
    let location = (hashPosition > -1) ? window.location.href.substr(hashPosition + 1) : '/';

    // Check if there's a querystring
    const qsPosition = location.indexOf('?');
    let querystring = '';
    if (qsPosition > -1) {
        querystring = location.substr(qsPosition + 1);
        location = location.substr(0, qsPosition);
    }

    return {location, querystring}
    }

    /**
     * Readable store that returns the current full location (incl. querystring)
     */
    const loc = readable(
    null,
    // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
        set(getLocation());

        const update = () => {
            set(getLocation());
        };
        window.addEventListener('hashchange', update, false);

        return function stop() {
            window.removeEventListener('hashchange', update, false);
        }
    }
    );

    /**
     * Readable store that returns the current location
     */
    const location = derived(
    loc,
    ($loc) => $loc.location
    );

    /**
     * Readable store that returns the current querystring
     */
    const querystring = derived(
    loc,
    ($loc) => $loc.querystring
    );

    function instance$1($$self, $$props, $$invalidate) {
    	

    /**
     * Dictionary of all routes, in the format `'/path': component`.
     *
     * For example:
     * ````js
     * import HomeRoute from './routes/HomeRoute.svelte'
     * import BooksRoute from './routes/BooksRoute.svelte'
     * import NotFoundRoute from './routes/NotFoundRoute.svelte'
     * routes = {
     *     '/': HomeRoute,
     *     '/books': BooksRoute,
     *     '*': NotFoundRoute
     * }
     * ````
     */
    let { routes = {}, prefix = '', restoreScrollState = false } = $$props;

    /**
     * Container for a route: path, component
     */
    class RouteItem {
        /**
         * Initializes the object and creates a regular expression from the path, using regexparam.
         *
         * @param {string} path - Path to the route (must start with '/' or '*')
         * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
         */
        constructor(path, component) {
            if (!component || (typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true))) {
                throw Error('Invalid component object')
            }

            // Path must be a regular or expression, or a string starting with '/' or '*'
            if (!path || 
                (typeof path == 'string' && (path.length < 1 || (path.charAt(0) != '/' && path.charAt(0) != '*'))) ||
                (typeof path == 'object' && !(path instanceof RegExp))
            ) {
                throw Error('Invalid value for "path" argument - strings must start with / or *')
            }

            const {pattern, keys} = regexparam(path);

            this.path = path;

            // Check if the component is wrapped and we have conditions
            if (typeof component == 'object' && component._sveltesparouter === true) {
                this.component = component.component;
                this.conditions = component.conditions || [];
                this.userData = component.userData;
                this.props = component.props || {};
            }
            else {
                // Convert the component to a function that returns a Promise, to normalize it
                this.component = () => Promise.resolve(component);
                this.conditions = [];
                this.props = {};
            }

            this._pattern = pattern;
            this._keys = keys;
        }

        /**
         * Checks if `path` matches the current route.
         * If there's a match, will return the list of parameters from the URL (if any).
         * In case of no match, the method will return `null`.
         *
         * @param {string} path - Path to test
         * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
         */
        match(path) {
            // If there's a prefix, check if it matches the start of the path.
            // If not, bail early, else remove it before we run the matching.
            if (prefix) {
                if (typeof prefix == 'string') {
                    if (path.startsWith(prefix)) {
                        path = path.substr(prefix.length) || '/';
                    }
                    else {
                        return null
                    }
                }
                else if (prefix instanceof RegExp) {
                    const match = path.match(prefix);
                    if (match && match[0]) {
                        path = path.substr(match[0].length) || '/';
                    }
                    else {
                        return null
                    }
                }
            }

            // Check if the pattern matches
            const matches = this._pattern.exec(path);
            if (matches === null) {
                return null
            }

            // If the input was a regular expression, this._keys would be false, so return matches as is
            if (this._keys === false) {
                return matches
            }

            const out = {};
            let i = 0;
            while (i < this._keys.length) {
                // In the match parameters, URL-decode all values
                try {
                    out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
                }
                catch (e) {
                    out[this._keys[i]] = null;
                }
                i++;
            }
            return out
        }

        /**
         * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
         * @typedef {Object} RouteDetail
         * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
         * @property {string} location - Location path
         * @property {string} querystring - Querystring from the hash
         * @property {object} [userData] - Custom data passed by the user
         * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
         * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
         */

        /**
         * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
         * 
         * @param {RouteDetail} detail - Route detail
         * @returns {bool} Returns true if all the conditions succeeded
         */
        async checkConditions(detail) {
            for (let i = 0; i < this.conditions.length; i++) {
                if (!(await this.conditions[i](detail))) {
                    return false
                }
            }

            return true
        }
    }

    // Set up all routes
    const routesList = [];
    if (routes instanceof Map) {
        // If it's a map, iterate on it right away
        routes.forEach((route, path) => {
            routesList.push(new RouteItem(path, route));
        });
    }
    else {
        // We have an object, so iterate on its own properties
        Object.keys(routes).forEach((path) => {
            routesList.push(new RouteItem(path, routes[path]));
        });
    }

    // Props for the component to render
    let component = null;
    let componentParams = null;
    let props = {};

    // Event dispatcher from Svelte
    const dispatch = createEventDispatcher();

    // Just like dispatch, but executes on the next iteration of the event loop
    async function dispatchNextTick(name, detail) {
        // Execute this code when the current call stack is complete
        await tick();
        dispatch(name, detail);
    }

    // If this is set, then that means we have popped into this var the state of our last scroll position
    let previousScrollState = null;

    if (restoreScrollState) {
        window.addEventListener('popstate', (event) => {
            // If this event was from our history.replaceState, event.state will contain
            // our scroll history. Otherwise, event.state will be null (like on forward
            // navigation)
            if (event.state && event.state.scrollY) {
                previousScrollState = event.state;
            }
            else {
                previousScrollState = null;
            }
        });

        afterUpdate(() => {
            // If this exists, then this is a back navigation: restore the scroll position
            if (previousScrollState) {
                window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
            }
            else {
                // Otherwise this is a forward navigation: scroll to top
                window.scrollTo(0, 0);
            }
        });
    }

    // Always have the latest value of loc
    let lastLoc = null;

    // Current object of the component loaded
    let componentObj = null;

    // Handle hash change events
    // Listen to changes in the $loc store and update the page
    // Do not use the $: syntax because it gets triggered by too many things
    loc.subscribe(async (newLoc) => {
        lastLoc = newLoc;

        // Find a route matching the location
        let i = 0;
        while (i < routesList.length) {
            const match = routesList[i].match(newLoc.location);
            if (!match) {
                i++;
                continue
            }

            const detail = {
                route: routesList[i].path,
                location: newLoc.location,
                querystring: newLoc.querystring,
                userData: routesList[i].userData
            };

            // Check if the route can be loaded - if all conditions succeed
            if (!(await routesList[i].checkConditions(detail))) {
                // Don't display anything
                $$invalidate('component', component = null);
                componentObj = null;
                // Trigger an event to notify the user, then exit
                dispatchNextTick('conditionsFailed', detail);
                return
            }
            
            // Trigger an event to alert that we're loading the route
            // We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
            dispatchNextTick('routeLoading', Object.assign({}, detail));

            // If there's a component to show while we're loading the route, display it
            const obj = routesList[i].component;
            // Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
            if (componentObj != obj) {
                if (obj.loading) {
                    $$invalidate('component', component = obj.loading);
                    componentObj = obj;
                    $$invalidate('componentParams', componentParams = obj.loadingParams);
                    $$invalidate('props', props = {});

                    // Trigger the routeLoaded event for the loading component
                    // Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
                    dispatchNextTick('routeLoaded', Object.assign({}, detail, {
                        component: component,
                        name: component.name
                    }));
                }
                else {
                    $$invalidate('component', component = null);
                    componentObj = null;
                }

                // Invoke the Promise
                const loaded = await obj();

                // Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
                if (newLoc != lastLoc) {
                    // Don't update the component, just exit
                    return
                }

                // If there is a "default" property, which is used by async routes, then pick that
                $$invalidate('component', component = (loaded && loaded.default) || loaded);
                componentObj = obj;
            }

            // Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
            // Of course, this assumes that developers always add a "params" prop when they are expecting parameters
            if (match && typeof match == 'object' && Object.keys(match).length) {
                $$invalidate('componentParams', componentParams = match);
            }
            else {
                $$invalidate('componentParams', componentParams = null);
            }

            // Set static props, if any
            $$invalidate('props', props = routesList[i].props);

            // Dispatch the routeLoaded event then exit
            // We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
            dispatchNextTick('routeLoaded', Object.assign({}, detail, {
                component: component,
                name: component.name
            }));
            return
        }

        // If we're still here, there was no match, so show the empty component
        $$invalidate('component', component = null);
        componentObj = null;
    });

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];
    	Object_1.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ('routes' in $$props) $$invalidate('routes', routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate('prefix', prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate('restoreScrollState', restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => {
    		return { routes, prefix, restoreScrollState, component, componentParams, props, previousScrollState, lastLoc, componentObj };
    	};

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate('routes', routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate('prefix', prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate('restoreScrollState', restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate('component', component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate('componentParams', componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate('props', props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	$$self.$$.update = ($$dirty = { restoreScrollState: 1 }) => {
    		if ($$dirty.restoreScrollState) { history.scrollRestoration = restoreScrollState ? 'manual' : 'auto'; }
    	};

    	return {
    		routes,
    		prefix,
    		restoreScrollState,
    		component,
    		componentParams,
    		props,
    		routeEvent_handler,
    		routeEvent_handler_1
    	};
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["routes", "prefix", "restoreScrollState"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Router", options, id: create_fragment$1.name });
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // List of nodes to update
    const nodes = [];

    // Current location
    let location$1;

    // Function that updates all nodes marking the active ones
    function checkActive(el) {
        const matchesLocation = el.pattern.test(location$1);
        toggleClasses(el, el.className, matchesLocation);
        toggleClasses(el, el.inactiveClassName, !matchesLocation);
    }

    function toggleClasses(el, className, shouldAdd) {
        (className || '').split(' ').forEach((cls) => {
            if (!cls) {
                return
            }
            // Remove the class firsts
            el.node.classList.remove(cls);

            // If the pattern doesn't match, then set the class
            if (shouldAdd) {
                el.node.classList.add(cls);
            }
        });
    }

    // Listen to changes in the location
    loc.subscribe((value) => {
        // Update the location
        location$1 = value.location + (value.querystring ? '?' + value.querystring : '');

        // Update all nodes
        nodes.map(checkActive);
    });

    /**
     * @typedef {Object} ActiveOptions
     * @property {string|RegExp} [path] - Path expression that makes the link active when matched (must start with '/' or '*'); default is the link's href
     * @property {string} [className] - CSS class to apply to the element when active; default value is "active"
     */

    /**
     * Svelte Action for automatically adding the "active" class to elements (links, or any other DOM element) when the current location matches a certain path.
     * 
     * @param {HTMLElement} node - The target node (automatically set by Svelte)
     * @param {ActiveOptions|string|RegExp} [opts] - Can be an object of type ActiveOptions, or a string (or regular expressions) representing ActiveOptions.path.
     * @returns {{destroy: function(): void}} Destroy function
     */
    function active(node, opts) {
        // Check options
        if (opts && (typeof opts == 'string' || (typeof opts == 'object' && opts instanceof RegExp))) {
            // Interpret strings and regular expressions as opts.path
            opts = {
                path: opts
            };
        }
        else {
            // Ensure opts is a dictionary
            opts = opts || {};
        }

        // Path defaults to link target
        if (!opts.path && node.hasAttribute('href')) {
            opts.path = node.getAttribute('href');
            if (opts.path && opts.path.length > 1 && opts.path.charAt(0) == '#') {
                opts.path = opts.path.substring(1);
            }
        }

        // Default class name
        if (!opts.className) {
            opts.className = 'active';
        }

        // If path is a string, it must start with '/' or '*'
        if (!opts.path || 
            typeof opts.path == 'string' && (opts.path.length < 1 || (opts.path.charAt(0) != '/' && opts.path.charAt(0) != '*'))
        ) {
            throw Error('Invalid value for "path" argument')
        }

        // If path is not a regular expression already, make it
        const {pattern} = typeof opts.path == 'string' ?
            regexparam(opts.path) :
            {pattern: opts.path};

        // Add the node to the list
        const el = {
            node,
            className: opts.className,
            inactiveClassName: opts.inactiveClassName,
            pattern
        };
        nodes.push(el);

        // Trigger the action right away
        checkActive(el);

        return {
            // When the element is destroyed, remove it from the list
            destroy() {
                nodes.splice(nodes.indexOf(el), 1);
            }
        }
    }

    /* svelte/content/Home.svelte generated by Svelte v3.12.1 */

    const file$1 = "svelte/content/Home.svelte";

    function create_fragment$2(ctx) {
    	var p, t_1, html_tag;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Home Page";
    			t_1 = space();
    			add_location(p, file$1, 12, 0, 229);
    			html_tag = new HtmlTag(ctx.htmlContent, null);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t_1, anchor);
    			html_tag.m(target, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.htmlContent) {
    				html_tag.p(ctx.htmlContent);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t_1);
    				html_tag.d();
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let htmlContent = "";
      fetch("/chapter/part1/index.html")
        .then((response) => {
          console.dir(response);
          return response.text();
        })
        .then((html) => {
          $$invalidate('htmlContent', htmlContent = html);
        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('htmlContent' in $$props) $$invalidate('htmlContent', htmlContent = $$props.htmlContent);
    	};

    	return { htmlContent };
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Home", options, id: create_fragment$2.name });
    	}
    }

    /* svelte/content/Test.svelte generated by Svelte v3.12.1 */

    const file$2 = "svelte/content/Test.svelte";

    function create_fragment$3(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Test";
    			add_location(p, file$2, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    class Test extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Test", options, id: create_fragment$3.name });
    	}
    }

    /* svelte/App.svelte generated by Svelte v3.12.1 */
    const { Error: Error_1$1 } = globals;

    const file$3 = "svelte/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.page = list[i];
    	return child_ctx;
    }

    // (48:4) {#if sitePages != null}
    function create_if_block$1(ctx) {
    	var each_1_anchor;

    	let each_value = ctx.sitePages;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.sitePages) {
    				each_value = ctx.sitePages;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(each_1_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(48:4) {#if sitePages != null}", ctx });
    	return block;
    }

    // (49:6) {#each sitePages as page}
    function create_each_block(ctx) {
    	var t0_value = ctx.page + "", t0, t1, a, t2_value = ctx.page[1] + "", t2, a_href_value, active_action;

    	const block = {
    		c: function create() {
    			t0 = text$1(t0_value);
    			t1 = space();
    			a = element("a");
    			t2 = text$1(t2_value);
    			attr_dev(a, "href", a_href_value = ctx.page[0]);
    			add_location(a, file$3, 50, 8, 1230);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, t2);
    			active_action = active.call(null, a) || {};
    		},

    		p: function update(changed, ctx) {
    			if ((changed.sitePages) && t0_value !== (t0_value = ctx.page + "")) {
    				set_data_dev(t0, t0_value);
    			}

    			if ((changed.sitePages) && t2_value !== (t2_value = ctx.page[1] + "")) {
    				set_data_dev(t2, t2_value);
    			}

    			if ((changed.sitePages) && a_href_value !== (a_href_value = ctx.page[0])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t0);
    				detach_dev(t1);
    				detach_dev(a);
    			}

    			if (active_action && typeof active_action.destroy === 'function') active_action.destroy();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(49:6) {#each sitePages as page}", ctx });
    	return block;
    }

    // (47:2) <span slot="sidebar">
    function create_sidebar_slot(ctx) {
    	var span;

    	var if_block = (ctx.sitePages != null) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr_dev(span, "slot", "sidebar");
    			add_location(span, file$3, 46, 2, 1125);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.sitePages != null) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(span, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}

    			if (if_block) if_block.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_sidebar_slot.name, type: "slot", source: "(47:2) <span slot=\"sidebar\">", ctx });
    	return block;
    }

    // (55:2) <span slot="content">
    function create_content_slot(ctx) {
    	var span, current;

    	var router = new Router({
    		props: { routes: ctx.routes },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			span = element("span");
    			router.$$.fragment.c();
    			attr_dev(span, "slot", "content");
    			add_location(span, file$3, 54, 2, 1309);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(router, span, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}

    			destroy_component(router);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_content_slot.name, type: "slot", source: "(55:2) <span slot=\"content\">", ctx });
    	return block;
    }

    // (46:0) <Sidebar>
    function create_default_slot(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(46:0) <Sidebar>", ctx });
    	return block;
    }

    function create_fragment$4(ctx) {
    	var current;

    	var sidebar = new Sidebar({
    		props: {
    		$$slots: {
    		default: [create_default_slot],
    		content: [create_content_slot],
    		sidebar: [create_sidebar_slot]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			sidebar.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(sidebar, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var sidebar_changes = {};
    			if (changed.$$scope || changed.sitePages) sidebar_changes.$$scope = { changed, ctx };
    			sidebar.$set(sidebar_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(sidebar, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	
      // import Page from "./Page.svelte";
      // import NotFound from "./NotFound.svelte";

      let sitePages = null;
      async function getSiteMap() {
        const response = await fetch("/_sitemap.dat");
        const content = await response.text();
        let lines = content.split(/\r?\n/);
        let pages = [];
        lines.forEach(function (page) {
          pages.push(page.split("$$"));
        });
        if (response.ok) {
          $$invalidate('sitePages', sitePages = pages);
          console.log(sitePages);
        } else {
          throw new Error(text);
        }
      }
      getSiteMap();

      const routes = {
        "/": Home,
        "/test": Test,
      };

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('sitePages' in $$props) $$invalidate('sitePages', sitePages = $$props.sitePages);
    	};

    	return { sitePages, routes };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$4.name });
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        name: "world",
      },
    });

    return app;

}());
//# sourceMappingURL=svelte.js.map
