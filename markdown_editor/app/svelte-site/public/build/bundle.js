
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
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

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

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
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
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
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Sidebar.svelte generated by Svelte v3.31.0 */

    const file = "src/Sidebar.svelte";
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});
    const get_top_content_slot_changes = dirty => ({});
    const get_top_content_slot_context = ctx => ({});
    const get_sidebar_slot_changes = dirty => ({});
    const get_sidebar_slot_context = ctx => ({});
    const get_sidebar_heading_slot_changes = dirty => ({});
    const get_sidebar_heading_slot_context = ctx => ({});

    // (100:33)        
    function fallback_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "TITLE";
    			attr_dev(div, "class", "sidebar-heading svelte-1etmblp");
    			add_location(div, file, 100, 6, 1855);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(100:33)        ",
    		ctx
    	});

    	return block;
    }

    // (121:8) {:else}
    function create_else_block(ctx) {
    	let img;
    	let img_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = text("\n          sidebar");
    			attr_dev(img, "class", "filter svelte-1etmblp");
    			if (img.src !== (img_src_value = "static/images/left-chevron.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "10px");
    			attr_dev(img, "alt", "open chevron");
    			add_location(img, file, 121, 10, 2418);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(121:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (114:8) {#if menuActive}
    function create_if_block(ctx) {
    	let t;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			t = text("sidebar\n          ");
    			img = element("img");
    			attr_dev(img, "class", "filter svelte-1etmblp");
    			if (img.src !== (img_src_value = "static/images/right-chevron.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "10px");
    			attr_dev(img, "alt", "close chevron");
    			add_location(img, file, 115, 10, 2250);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(114:8) {#if menuActive}",
    		ctx
    	});

    	return block;
    }

    // (130:31)          
    function fallback_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Menu Items";
    			attr_dev(div, "class", "navbar-brand");
    			add_location(div, file, 130, 8, 2646);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(130:31)          ",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div4;
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let div3;
    	let nav;
    	let button;
    	let t2;
    	let t3;
    	let div2;
    	let current;
    	let mounted;
    	let dispose;
    	const sidebar_heading_slot_template = /*#slots*/ ctx[2]["sidebar-heading"];
    	const sidebar_heading_slot = create_slot(sidebar_heading_slot_template, ctx, /*$$scope*/ ctx[1], get_sidebar_heading_slot_context);
    	const sidebar_heading_slot_or_fallback = sidebar_heading_slot || fallback_block_1(ctx);
    	const sidebar_slot_template = /*#slots*/ ctx[2].sidebar;
    	const sidebar_slot = create_slot(sidebar_slot_template, ctx, /*$$scope*/ ctx[1], get_sidebar_slot_context);

    	function select_block_type(ctx, dirty) {
    		if (/*menuActive*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	const top_content_slot_template = /*#slots*/ ctx[2]["top-content"];
    	const top_content_slot = create_slot(top_content_slot_template, ctx, /*$$scope*/ ctx[1], get_top_content_slot_context);
    	const top_content_slot_or_fallback = top_content_slot || fallback_block(ctx);
    	const content_slot_template = /*#slots*/ ctx[2].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[1], get_content_slot_context);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			if (sidebar_heading_slot_or_fallback) sidebar_heading_slot_or_fallback.c();
    			t0 = space();
    			div0 = element("div");
    			if (sidebar_slot) sidebar_slot.c();
    			t1 = space();
    			div3 = element("div");
    			nav = element("nav");
    			button = element("button");
    			if_block.c();
    			t2 = space();
    			if (top_content_slot_or_fallback) top_content_slot_or_fallback.c();
    			t3 = space();
    			div2 = element("div");
    			if (content_slot) content_slot.c();
    			attr_dev(div0, "class", "list-group list-group-flush svelte-1etmblp");
    			add_location(div0, file, 102, 4, 1912);
    			attr_dev(div1, "class", "border-right svelte-1etmblp");
    			attr_dev(div1, "id", "sidebar-wrapper");
    			add_location(div1, file, 98, 2, 1767);
    			attr_dev(button, "class", "navbar-toggler no-border svelte-1etmblp");
    			attr_dev(button, "id", "menu-toggle");
    			add_location(button, file, 109, 6, 2070);
    			attr_dev(nav, "class", "navbar svelte-1etmblp");
    			add_location(nav, file, 108, 4, 2043);
    			attr_dev(div2, "class", "container-fluid content-container svelte-1etmblp");
    			add_location(div2, file, 133, 4, 2718);
    			attr_dev(div3, "id", "page-content-wrapper");
    			attr_dev(div3, "class", "svelte-1etmblp");
    			add_location(div3, file, 107, 2, 2007);
    			attr_dev(div4, "class", "d-flex svelte-1etmblp");
    			attr_dev(div4, "id", "wrapper");
    			toggle_class(div4, "toggled", /*menuActive*/ ctx[0]);
    			add_location(div4, file, 97, 0, 1704);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);

    			if (sidebar_heading_slot_or_fallback) {
    				sidebar_heading_slot_or_fallback.m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			if (sidebar_slot) {
    				sidebar_slot.m(div0, null);
    			}

    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, nav);
    			append_dev(nav, button);
    			if_block.m(button, null);
    			append_dev(nav, t2);

    			if (top_content_slot_or_fallback) {
    				top_content_slot_or_fallback.m(nav, null);
    			}

    			append_dev(div3, t3);
    			append_dev(div3, div2);

    			if (content_slot) {
    				content_slot.m(div2, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (sidebar_heading_slot) {
    				if (sidebar_heading_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(sidebar_heading_slot, sidebar_heading_slot_template, ctx, /*$$scope*/ ctx[1], dirty, get_sidebar_heading_slot_changes, get_sidebar_heading_slot_context);
    				}
    			}

    			if (sidebar_slot) {
    				if (sidebar_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(sidebar_slot, sidebar_slot_template, ctx, /*$$scope*/ ctx[1], dirty, get_sidebar_slot_changes, get_sidebar_slot_context);
    				}
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, null);
    				}
    			}

    			if (top_content_slot) {
    				if (top_content_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(top_content_slot, top_content_slot_template, ctx, /*$$scope*/ ctx[1], dirty, get_top_content_slot_changes, get_top_content_slot_context);
    				}
    			}

    			if (content_slot) {
    				if (content_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(content_slot, content_slot_template, ctx, /*$$scope*/ ctx[1], dirty, get_content_slot_changes, get_content_slot_context);
    				}
    			}

    			if (dirty & /*menuActive*/ 1) {
    				toggle_class(div4, "toggled", /*menuActive*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar_heading_slot_or_fallback, local);
    			transition_in(sidebar_slot, local);
    			transition_in(top_content_slot_or_fallback, local);
    			transition_in(content_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar_heading_slot_or_fallback, local);
    			transition_out(sidebar_slot, local);
    			transition_out(top_content_slot_or_fallback, local);
    			transition_out(content_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (sidebar_heading_slot_or_fallback) sidebar_heading_slot_or_fallback.d(detaching);
    			if (sidebar_slot) sidebar_slot.d(detaching);
    			if_block.d();
    			if (top_content_slot_or_fallback) top_content_slot_or_fallback.d(detaching);
    			if (content_slot) content_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sidebar", slots, ['sidebar-heading','sidebar','top-content','content']);
    	let menuActive = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sidebar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, menuActive = !menuActive);

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ menuActive });

    	$$self.$inject_state = $$props => {
    		if ("menuActive" in $$props) $$invalidate(0, menuActive = $$props.menuActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [menuActive, $$scope, slots, click_handler];
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
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
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
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

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.31.0 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (209:0) {:else}
    function create_else_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
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
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
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
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
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
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
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
    				} else {
    					if_block.p(ctx, dirty);
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
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap$1(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap({ component, userData, conditions });
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
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		window.history.replaceState(undefined, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, hrefVar || node.getAttribute("href"));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	// Add # to the href attribute
    	node.setAttribute("href", "#" + href);

    	node.addEventListener("click", scrollstateHistoryHandler);
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
     */
    function scrollstateHistoryHandler(event) {
    	// Prevent default anchor onclick behaviour
    	event.preventDefault();

    	const href = event.currentTarget.getAttribute("href");

    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

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
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
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
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
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
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
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
    		window.addEventListener("popstate", event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
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
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		tick,
    		_wrap: wrap,
    		wrap: wrap$1,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		scrollstateHistoryHandler,
    		createEventDispatcher,
    		afterUpdate,
    		regexparam,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		lastLoc,
    		componentObj
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			 history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$1.name
    		});
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

    /* src/content/with_space/goods.svelte generated by Svelte v3.31.0 */

    const file$1 = "src/content/with_space/goods.svelte";

    function create_fragment$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "sadf";
    			add_location(p, file$1, 0, 0, 0);
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
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Goods", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Goods> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Goods extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Goods",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/content/with_space/home.svelte generated by Svelte v3.31.0 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/content/with_space/testing.svelte generated by Svelte v3.31.0 */

    const file$2 = "src/content/with_space/testing.svelte";

    function create_fragment$4(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "# Title";
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
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Testing", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Testing> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Testing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Testing",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/content/storage/magnetic_tape.svelte generated by Svelte v3.31.0 */
    const file$3 = "src/content/storage/magnetic_tape.svelte";

    function create_fragment$5(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let t2;
    	let a0;
    	let link_action;
    	let t4;
    	let strong0;
    	let t6;
    	let a1;
    	let link_action_1;
    	let t8;
    	let strong1;
    	let t10;
    	let strong2;
    	let t12;
    	let a2;
    	let link_action_2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Magnetic tape";
    			t1 = space();
    			p = element("p");
    			t2 = text("Magnetic tape is a ");
    			a0 = element("a");
    			a0.textContent = "serial";
    			t4 = text(" storage device that stores data ");
    			strong0 = element("strong");
    			strong0.textContent = "sequentially";
    			t6 = text(" on the magnetically-coated surface of a plastic tape.\n![[sequentialdatastorage.png]]\nData stored in this way makes accessing a specific file a very slow process, but it is useful as a ");
    			a1 = element("a");
    			a1.textContent = "backup";
    			t8 = text(" storage medium due to its ");
    			strong1 = element("strong");
    			strong1.textContent = "low cost per gigabyte";
    			t10 = text(" and ");
    			strong2 = element("strong");
    			strong2.textContent = "robustness";
    			t12 = text(". ");
    			a2 = element("a");
    			a2.textContent = "bananas";
    			add_location(h1, file$3, 2, 0, 60);
    			attr_dev(a0, "href", "/storage/serial");
    			add_location(a0, file$3, 3, 22, 105);
    			add_location(strong0, file$3, 3, 100, 183);
    			attr_dev(a1, "href", "/storage/backup");
    			add_location(a1, file$3, 5, 99, 397);
    			add_location(strong1, file$3, 5, 171, 469);
    			add_location(strong2, file$3, 5, 214, 512);
    			attr_dev(a2, "href", "/peripherals/bananas");
    			add_location(a2, file$3, 5, 243, 541);
    			add_location(p, file$3, 3, 0, 83);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			append_dev(p, a0);
    			append_dev(p, t4);
    			append_dev(p, strong0);
    			append_dev(p, t6);
    			append_dev(p, a1);
    			append_dev(p, t8);
    			append_dev(p, strong1);
    			append_dev(p, t10);
    			append_dev(p, strong2);
    			append_dev(p, t12);
    			append_dev(p, a2);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a0)),
    					action_destroyer(link_action_1 = link.call(null, a1)),
    					action_destroyer(link_action_2 = link.call(null, a2))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Magnetic_tape", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Magnetic_tape> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Magnetic_tape extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Magnetic_tape",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/content/storage/optical.svelte generated by Svelte v3.31.0 */
    const file$4 = "src/content/storage/optical.svelte";

    function create_fragment$6(ctx) {
    	let h1;
    	let t1;
    	let pre;
    	let code;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Optical storage devices";
    			t1 = space();
    			pre = element("pre");
    			code = element("code");
    			code.textContent = "[[CD]]";
    			add_location(h1, file$4, 2, 0, 60);
    			add_location(code, file$4, 3, 5, 98);
    			add_location(pre, file$4, 3, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, pre, anchor);
    			append_dev(pre, code);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(pre);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Optical", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Optical> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Optical extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Optical",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/content/storage/serial.svelte generated by Svelte v3.31.0 */
    const file$5 = "src/content/storage/serial.svelte";

    function create_fragment$7(ctx) {
    	let h1;
    	let t1;
    	let p0;
    	let t2;
    	let strong0;
    	let t4;
    	let a0;
    	let link_action;
    	let t6;
    	let strong1;
    	let t8;
    	let t9;
    	let p1;
    	let t11;
    	let p2;
    	let t12;
    	let a1;
    	let link_action_1;
    	let t14;
    	let a2;
    	let link_action_2;
    	let t16;
    	let t17;
    	let p3;
    	let t18;
    	let em;
    	let t20;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Serial data access";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("In ");
    			strong0 = element("strong");
    			strong0.textContent = "serial";
    			t4 = text(" data ");
    			a0 = element("a");
    			a0.textContent = "storage/home";
    			t6 = text(" devices, data is stored in ");
    			strong1 = element("strong");
    			strong1.textContent = "sequential";
    			t8 = text(" order.");
    			t9 = space();
    			p1 = element("p");
    			p1.textContent = "![[sequentialdatastorage.png]]";
    			t11 = space();
    			p2 = element("p");
    			t12 = text("This approach can be highly effective for use in ");
    			a1 = element("a");
    			a1.textContent = "backup";
    			t14 = text(" strategies, but is less useful when files need to be accessed randomly as it is in ");
    			a2 = element("a");
    			a2.textContent = "direct";
    			t16 = text(" storage devices.");
    			t17 = space();
    			p3 = element("p");
    			t18 = text("[[Magnetic tape]] is the ");
    			em = element("em");
    			em.textContent = "only";
    			t20 = text(" example of a serial data storage device in the syllabus.");
    			add_location(h1, file$5, 2, 0, 60);
    			add_location(strong0, file$5, 3, 6, 94);
    			attr_dev(a0, "href", "/storage/home");
    			add_location(a0, file$5, 3, 35, 123);
    			add_location(strong1, file$5, 3, 112, 200);
    			add_location(p0, file$5, 3, 0, 88);
    			add_location(p1, file$5, 4, 0, 239);
    			attr_dev(a1, "href", "/storage/backup");
    			add_location(a1, file$5, 5, 52, 329);
    			attr_dev(a2, "href", "/storage/direct");
    			add_location(a2, file$5, 5, 181, 458);
    			add_location(p2, file$5, 5, 0, 277);
    			add_location(em, file$5, 6, 28, 553);
    			add_location(p3, file$5, 6, 0, 525);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t2);
    			append_dev(p0, strong0);
    			append_dev(p0, t4);
    			append_dev(p0, a0);
    			append_dev(p0, t6);
    			append_dev(p0, strong1);
    			append_dev(p0, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t12);
    			append_dev(p2, a1);
    			append_dev(p2, t14);
    			append_dev(p2, a2);
    			append_dev(p2, t16);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, p3, anchor);
    			append_dev(p3, t18);
    			append_dev(p3, em);
    			append_dev(p3, t20);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a0)),
    					action_destroyer(link_action_1 = link.call(null, a1)),
    					action_destroyer(link_action_2 = link.call(null, a2))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(p3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Serial", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Serial> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Serial extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Serial",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/content/storage/direct.svelte generated by Svelte v3.31.0 */

    const file$6 = "src/content/storage/direct.svelte";

    function create_fragment$8(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Direct data storage";
    			add_location(h1, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Direct", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Direct> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Direct extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Direct",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/content/storage/SSD.svelte generated by Svelte v3.31.0 */

    function create_fragment$9(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SSD", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SSD> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class SSD extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SSD",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/content/storage/hard_disks.svelte generated by Svelte v3.31.0 */
    const file$7 = "src/content/storage/hard_disks.svelte";

    function create_fragment$a(ctx) {
    	let h1;
    	let t1;
    	let p0;
    	let t2;
    	let a0;
    	let link_action;
    	let t4;
    	let a1;
    	let link_action_1;
    	let t6;
    	let a2;
    	let link_action_2;
    	let t8;
    	let strong0;
    	let t10;
    	let strong1;
    	let t12;
    	let t13;
    	let p1;
    	let t14;
    	let strong2;
    	let t16;
    	let t17;
    	let p2;
    	let t18;
    	let strong3;
    	let t20;
    	let a3;
    	let link_action_3;
    	let t22;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Magnetic hard disks";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("Hard disks magnetically charge sectors of rotating platters to store ");
    			a0 = element("a");
    			a0.textContent = "storage/binary";
    			t4 = text(" data. They are ");
    			a1 = element("a");
    			a1.textContent = "secondary";
    			t6 = space();
    			a2 = element("a");
    			a2.textContent = "storage/home";
    			t8 = text(" devices that are commonly found in desktop and laptop computers because of their ");
    			strong0 = element("strong");
    			strong0.textContent = "low cost per gigabyte";
    			t10 = text(" and ");
    			strong1 = element("strong");
    			strong1.textContent = "high capacity";
    			t12 = text(".");
    			t13 = space();
    			p1 = element("p");
    			t14 = text("Hard drive capacities have expanded in recent years due tosectors on drives being made smaller, and by more platters being included inside the drive itself.\n![[readwritehead.png]]\nData is read from the platters by a ");
    			strong2 = element("strong");
    			strong2.textContent = "read/write head";
    			t16 = text(" that is so close to the platter that a single piece of dust could damage it, so the enclosures are sealed to prevent damage.");
    			t17 = space();
    			p2 = element("p");
    			t18 = text("Hard disks are ");
    			strong3 = element("strong");
    			strong3.textContent = "slower";
    			t20 = text(" than ");
    			a3 = element("a");
    			a3.textContent = "solid state";
    			t22 = text(" forms of storage because of the moving parts inside the enclosure.");
    			add_location(h1, file$7, 2, 0, 60);
    			attr_dev(a0, "href", "/storage/binary");
    			add_location(a0, file$7, 3, 72, 161);
    			attr_dev(a1, "href", "/storage/secondary");
    			add_location(a1, file$7, 3, 141, 230);
    			attr_dev(a2, "href", "/storage/home");
    			add_location(a2, file$7, 3, 193, 282);
    			add_location(strong0, file$7, 3, 324, 413);
    			add_location(strong1, file$7, 3, 367, 456);
    			add_location(p0, file$7, 3, 0, 89);
    			add_location(strong2, file$7, 6, 36, 711);
    			add_location(p1, file$7, 4, 0, 492);
    			add_location(strong3, file$7, 7, 18, 891);
    			attr_dev(a3, "href", "/storage/solid_state");
    			add_location(a3, file$7, 7, 47, 920);
    			add_location(p2, file$7, 7, 0, 873);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t2);
    			append_dev(p0, a0);
    			append_dev(p0, t4);
    			append_dev(p0, a1);
    			append_dev(p0, t6);
    			append_dev(p0, a2);
    			append_dev(p0, t8);
    			append_dev(p0, strong0);
    			append_dev(p0, t10);
    			append_dev(p0, strong1);
    			append_dev(p0, t12);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t14);
    			append_dev(p1, strong2);
    			append_dev(p1, t16);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t18);
    			append_dev(p2, strong3);
    			append_dev(p2, t20);
    			append_dev(p2, a3);
    			append_dev(p2, t22);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a0)),
    					action_destroyer(link_action_1 = link.call(null, a1)),
    					action_destroyer(link_action_2 = link.call(null, a2)),
    					action_destroyer(link_action_3 = link.call(null, a3))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(p2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hard_disks", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hard_disks> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Hard_disks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hard_disks",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/content/storage/primary.svelte generated by Svelte v3.31.0 */

    const file$8 = "src/content/storage/primary.svelte";

    function create_fragment$b(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Primary storage";
    			add_location(h1, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Primary", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Primary> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Primary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Primary",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/content/storage/backup.svelte generated by Svelte v3.31.0 */
    const file$9 = "src/content/storage/backup.svelte";

    function create_fragment$c(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let a0;
    	let t3;
    	let a1;
    	let link_action;
    	let t5;
    	let a2;
    	let link_action_1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Backup";
    			t1 = space();
    			p = element("p");
    			a0 = element("a");
    			a0.textContent = "Binary";
    			t3 = space();
    			a1 = element("a");
    			a1.textContent = "peripherals/keyboard";
    			t5 = space();
    			a2 = element("a");
    			a2.textContent = "goods";
    			add_location(h1, file$9, 2, 0, 60);
    			attr_dev(a0, "href", "binary.html");
    			add_location(a0, file$9, 3, 3, 79);
    			attr_dev(a1, "href", "/peripherals/keyboard");
    			add_location(a1, file$9, 4, 0, 114);
    			attr_dev(a2, "href", "/with_space/goods");
    			add_location(a2, file$9, 4, 66, 180);
    			add_location(p, file$9, 3, 0, 76);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, a0);
    			append_dev(p, t3);
    			append_dev(p, a1);
    			append_dev(p, t5);
    			append_dev(p, a2);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a1)),
    					action_destroyer(link_action_1 = link.call(null, a2))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Backup", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Backup> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Backup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Backup",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/content/storage/data.svelte generated by Svelte v3.31.0 */
    const file$a = "src/content/storage/data.svelte";

    function create_fragment$d(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let t2;
    	let a0;
    	let link_action;
    	let t4;
    	let a1;
    	let link_action_1;
    	let t6;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Data";
    			t1 = space();
    			p = element("p");
    			t2 = text("Data in computer systems is stored using ");
    			a0 = element("a");
    			a0.textContent = "storage/binary";
    			t4 = text(" code on a variety of ");
    			a1 = element("a");
    			a1.textContent = "storage/home";
    			t6 = text(" devices.");
    			add_location(h1, file$a, 2, 0, 60);
    			attr_dev(a0, "href", "/storage/binary");
    			add_location(a0, file$a, 3, 44, 118);
    			attr_dev(a1, "href", "/storage/home");
    			add_location(a1, file$a, 3, 119, 193);
    			add_location(p, file$a, 3, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			append_dev(p, a0);
    			append_dev(p, t4);
    			append_dev(p, a1);
    			append_dev(p, t6);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a0)),
    					action_destroyer(link_action_1 = link.call(null, a1))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Data", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Data> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Data extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Data",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/content/storage/binary.svelte generated by Svelte v3.31.0 */
    const file$b = "src/content/storage/binary.svelte";

    function create_fragment$e(ctx) {
    	let h1;
    	let t1;
    	let p0;
    	let t2;
    	let strong0;
    	let t4;
    	let strong1;
    	let t6;
    	let t7;
    	let h2;
    	let t9;
    	let p1;
    	let t10;
    	let strong2;
    	let t12;
    	let a0;
    	let link_action;
    	let t14;
    	let t15;
    	let p2;
    	let t17;
    	let p3;
    	let t19;
    	let p4;
    	let t21;
    	let p5;
    	let t22;
    	let a1;
    	let link_action_1;
    	let t24;
    	let a2;
    	let link_action_2;
    	let t26;
    	let a3;
    	let link_action_3;
    	let t28;
    	let strong3;
    	let t30;
    	let t31;
    	let h4;
    	let t33;
    	let p6;
    	let t34;
    	let strong4;
    	let t36;
    	let t37;
    	let p7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Binary";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("Binary code is the fundamental language of the computer, using only two digits (");
    			strong0 = element("strong");
    			strong0.textContent = "0s";
    			t4 = text(" and ");
    			strong1 = element("strong");
    			strong1.textContent = "1s";
    			t6 = text(") to represent data in a computer system.");
    			t7 = space();
    			h2 = element("h2");
    			h2.textContent = "Bits and bytes";
    			t9 = space();
    			p1 = element("p");
    			t10 = text("Each zero or one is called a ");
    			strong2 = element("strong");
    			strong2.textContent = "bit";
    			t12 = text(" (binary digit), which is held in ");
    			a0 = element("a");
    			a0.textContent = "storage/home";
    			t14 = text(" using some form of on/off switch. You can use a form of binary counting to count to 31 on the fingers of one hand.");
    			t15 = space();
    			p2 = element("p");
    			p2.textContent = "If your thumb is worth 1, each finger doubles in value: your index finger is worth 2, middle finger is 4, ring finger is 8 and little finger is 16:\n![[hand.png]]";
    			t17 = space();
    			p3 = element("p");
    			p3.textContent = "Using this system, we can count from zero (closed fist) to 31 (all fingers outstretched), and each number in-between:";
    			t19 = space();
    			p4 = element("p");
    			p4.textContent = "![[binary counting on fingers.png]]";
    			t21 = space();
    			p5 = element("p");
    			t22 = text("The way that bits are represented is different in ");
    			a1 = element("a");
    			a1.textContent = "magnetic";
    			t24 = text(", ");
    			a2 = element("a");
    			a2.textContent = "optical";
    			t26 = text(" and ");
    			a3 = element("a");
    			a3.textContent = "solid state";
    			t28 = text(" storage devices, but the principle remains the same: combinations of 0s and 1s just like the fingers \nBits can be combined into ");
    			strong3 = element("strong");
    			strong3.textContent = "strings";
    			t30 = text(" that can represent a wide variety of different kinds of data, including:");
    			t31 = space();
    			h4 = element("h4");
    			h4.textContent = "Text";
    			t33 = space();
    			p6 = element("p");
    			t34 = text("Each letter of the alphabet is ");
    			strong4 = element("strong");
    			strong4.textContent = "one byte long";
    			t36 = text(", with each letter being represented in binary by eight bits, as follows:");
    			t37 = space();
    			p7 = element("p");
    			p7.textContent = "| Letter | Binary   |\n|--------|----------|\n| A      | 01000001 |\n| B      | 01000010 |\n| C      | 01000011 |\n| D      | 01000100 |";
    			add_location(h1, file$b, 2, 0, 60);
    			add_location(strong0, file$b, 3, 83, 159);
    			add_location(strong1, file$b, 3, 107, 183);
    			add_location(p0, file$b, 3, 0, 76);
    			add_location(h2, file$b, 4, 0, 248);
    			add_location(strong2, file$b, 5, 32, 304);
    			attr_dev(a0, "href", "/storage/home");
    			add_location(a0, file$b, 5, 86, 358);
    			add_location(p1, file$b, 5, 0, 272);
    			add_location(p2, file$b, 6, 0, 527);
    			add_location(p3, file$b, 8, 0, 696);
    			add_location(p4, file$b, 9, 0, 821);
    			attr_dev(a1, "href", "/storage/magnetic");
    			add_location(a1, file$b, 10, 53, 917);
    			attr_dev(a2, "href", "/storage/optical");
    			add_location(a2, file$b, 10, 104, 968);
    			attr_dev(a3, "href", "/storage/solid_state");
    			add_location(a3, file$b, 10, 156, 1020);
    			add_location(strong3, file$b, 11, 26, 1204);
    			add_location(p5, file$b, 10, 0, 864);
    			add_location(h4, file$b, 12, 0, 1306);
    			add_location(strong4, file$b, 13, 34, 1354);
    			add_location(p6, file$b, 13, 0, 1320);
    			add_location(p7, file$b, 14, 0, 1462);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t2);
    			append_dev(p0, strong0);
    			append_dev(p0, t4);
    			append_dev(p0, strong1);
    			append_dev(p0, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t10);
    			append_dev(p1, strong2);
    			append_dev(p1, t12);
    			append_dev(p1, a0);
    			append_dev(p1, t14);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, p5, anchor);
    			append_dev(p5, t22);
    			append_dev(p5, a1);
    			append_dev(p5, t24);
    			append_dev(p5, a2);
    			append_dev(p5, t26);
    			append_dev(p5, a3);
    			append_dev(p5, t28);
    			append_dev(p5, strong3);
    			append_dev(p5, t30);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, p6, anchor);
    			append_dev(p6, t34);
    			append_dev(p6, strong4);
    			append_dev(p6, t36);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, p7, anchor);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a0)),
    					action_destroyer(link_action_1 = link.call(null, a1)),
    					action_destroyer(link_action_2 = link.call(null, a2)),
    					action_destroyer(link_action_3 = link.call(null, a3))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(p7);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Binary", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Binary> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Binary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Binary",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/content/storage/home.svelte generated by Svelte v3.31.0 */
    const file$c = "src/content/storage/home.svelte";

    function create_fragment$f(ctx) {
    	let h1;
    	let t1;
    	let p0;
    	let t2;
    	let a0;
    	let link_action;
    	let t4;
    	let a1;
    	let link_action_1;
    	let t6;
    	let a2;
    	let link_action_2;
    	let t8;
    	let t9;
    	let p1;
    	let t10;
    	let strong;
    	let t12;
    	let a3;
    	let link_action_3;
    	let t14;
    	let a4;
    	let link_action_4;
    	let t16;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Storage";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("Storage devices in computer systems are the components that ");
    			a0 = element("a");
    			a0.textContent = "storage/binary";
    			t4 = text(" data is stored on and retrieved from. Temporary memory including RAM is ");
    			a1 = element("a");
    			a1.textContent = "primary";
    			t6 = text(" storage, while permanent memory where files are saved for long-term use is ");
    			a2 = element("a");
    			a2.textContent = "secondary";
    			t8 = text(" storage.");
    			t9 = space();
    			p1 = element("p");
    			t10 = text("There are ");
    			strong = element("strong");
    			strong.textContent = "three";
    			t12 = text(" main categories of storage devices in a computer: ");
    			a3 = element("a");
    			a3.textContent = "magnetic";
    			t14 = text(", ");
    			a4 = element("a");
    			a4.textContent = "optical";
    			t16 = text(" and [[solid state storage]].");
    			add_location(h1, file$c, 2, 0, 60);
    			attr_dev(a0, "href", "/storage/binary");
    			add_location(a0, file$c, 3, 63, 140);
    			attr_dev(a1, "href", "/storage/primary");
    			add_location(a1, file$c, 3, 189, 266);
    			attr_dev(a2, "href", "/storage/secondary");
    			add_location(a2, file$c, 3, 312, 389);
    			add_location(p0, file$c, 3, 0, 77);
    			add_location(strong, file$c, 4, 13, 467);
    			attr_dev(a3, "href", "/storage/magnetic");
    			add_location(a3, file$c, 4, 86, 540);
    			attr_dev(a4, "href", "/storage/optical");
    			add_location(a4, file$c, 4, 137, 591);
    			add_location(p1, file$c, 4, 0, 454);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t2);
    			append_dev(p0, a0);
    			append_dev(p0, t4);
    			append_dev(p0, a1);
    			append_dev(p0, t6);
    			append_dev(p0, a2);
    			append_dev(p0, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t10);
    			append_dev(p1, strong);
    			append_dev(p1, t12);
    			append_dev(p1, a3);
    			append_dev(p1, t14);
    			append_dev(p1, a4);
    			append_dev(p1, t16);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a0)),
    					action_destroyer(link_action_1 = link.call(null, a1)),
    					action_destroyer(link_action_2 = link.call(null, a2)),
    					action_destroyer(link_action_3 = link.call(null, a3)),
    					action_destroyer(link_action_4 = link.call(null, a4))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Home$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/content/storage/solid_state.svelte generated by Svelte v3.31.0 */
    const file$d = "src/content/storage/solid_state.svelte";

    function create_fragment$g(ctx) {
    	let h1;
    	let t1;
    	let hr0;
    	let t2;
    	let p0;
    	let t3;
    	let a0;
    	let link_action;
    	let t5;
    	let a1;
    	let link_action_1;
    	let t7;
    	let t8;
    	let hr1;
    	let t9;
    	let p1;
    	let t10;
    	let strong0;
    	let t12;
    	let strong1;
    	let t14;
    	let a2;
    	let link_action_2;
    	let t16;
    	let strong2;
    	let t18;
    	let t19;
    	let p2;
    	let a3;
    	let link_action_3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Solid state";
    			t1 = space();
    			hr0 = element("hr");
    			t2 = space();
    			p0 = element("p");
    			t3 = text("In solid state ");
    			a0 = element("a");
    			a0.textContent = "storage/home";
    			t5 = text(" devices, ");
    			a1 = element("a");
    			a1.textContent = "storage/binary";
    			t7 = text(" data is stored with the presence or absence of an electrical charge, meaning there are no moving parts as there are in other storage devices.");
    			t8 = space();
    			hr1 = element("hr");
    			t9 = space();
    			p1 = element("p");
    			t10 = text("As a result, solid state devices are  ");
    			strong0 = element("strong");
    			strong0.textContent = "much faster";
    			t12 = text(" and ");
    			strong1 = element("strong");
    			strong1.textContent = "more robust";
    			t14 = text(" than their ");
    			a2 = element("a");
    			a2.textContent = "magnetic";
    			t16 = text(" counterparts, and are generally ");
    			strong2 = element("strong");
    			strong2.textContent = "more expensive";
    			t18 = text(".");
    			t19 = space();
    			p2 = element("p");
    			a3 = element("a");
    			a3.textContent = "SSD";
    			add_location(h1, file$d, 2, 0, 60);
    			add_location(hr0, file$d, 3, 0, 81);
    			attr_dev(a0, "href", "/storage/home");
    			add_location(a0, file$d, 4, 18, 106);
    			attr_dev(a1, "href", "/storage/binary");
    			add_location(a1, file$d, 4, 77, 165);
    			add_location(p0, file$d, 4, 0, 88);
    			add_location(hr1, file$d, 5, 0, 365);
    			add_location(strong0, file$d, 6, 41, 413);
    			add_location(strong1, file$d, 6, 74, 446);
    			attr_dev(a2, "href", "/storage/magnetic");
    			add_location(a2, file$d, 6, 114, 486);
    			add_location(strong2, file$d, 6, 196, 568);
    			add_location(p1, file$d, 6, 0, 372);
    			attr_dev(a3, "href", "/storage/SSD");
    			add_location(a3, file$d, 7, 3, 608);
    			add_location(p2, file$d, 7, 0, 605);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t3);
    			append_dev(p0, a0);
    			append_dev(p0, t5);
    			append_dev(p0, a1);
    			append_dev(p0, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t10);
    			append_dev(p1, strong0);
    			append_dev(p1, t12);
    			append_dev(p1, strong1);
    			append_dev(p1, t14);
    			append_dev(p1, a2);
    			append_dev(p1, t16);
    			append_dev(p1, strong2);
    			append_dev(p1, t18);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, a3);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a0)),
    					action_destroyer(link_action_1 = link.call(null, a1)),
    					action_destroyer(link_action_2 = link.call(null, a2)),
    					action_destroyer(link_action_3 = link.call(null, a3))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(p2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Solid_state", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Solid_state> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Solid_state extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Solid_state",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/content/storage/secondary.svelte generated by Svelte v3.31.0 */
    const file$e = "src/content/storage/secondary.svelte";

    function create_fragment$h(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let strong;
    	let t2;
    	let a0;
    	let link_action;
    	let t4;
    	let a1;
    	let link_action_1;
    	let t6;
    	let a2;
    	let link_action_2;
    	let t8;
    	let a3;
    	let link_action_3;
    	let t10;
    	let a4;
    	let link_action_4;
    	let t12;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Secondary storage";
    			t1 = space();
    			p = element("p");
    			strong = element("strong");
    			t2 = text("Secondary ");
    			a0 = element("a");
    			a0.textContent = "storage/home";
    			t4 = text(" refers to any permanent store of ");
    			a1 = element("a");
    			a1.textContent = "data";
    			t6 = text(". This includes ");
    			a2 = element("a");
    			a2.textContent = "magnetic";
    			t8 = text(", ");
    			a3 = element("a");
    			a3.textContent = "optical";
    			t10 = text(" and ");
    			a4 = element("a");
    			a4.textContent = "solid state";
    			t12 = text(" storage.");
    			add_location(h1, file$e, 2, 0, 60);
    			attr_dev(a0, "href", "/storage/home");
    			add_location(a0, file$e, 3, 21, 108);
    			add_location(strong, file$e, 3, 3, 90);
    			attr_dev(a1, "href", "/storage/data");
    			add_location(a1, file$e, 3, 113, 200);
    			attr_dev(a2, "href", "/storage/magnetic");
    			add_location(a2, file$e, 3, 170, 257);
    			attr_dev(a3, "href", "/storage/optical");
    			add_location(a3, file$e, 3, 221, 308);
    			attr_dev(a4, "href", "/storage/solid_state");
    			add_location(a4, file$e, 3, 273, 360);
    			add_location(p, file$e, 3, 0, 87);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, strong);
    			append_dev(strong, t2);
    			append_dev(strong, a0);
    			append_dev(p, t4);
    			append_dev(p, a1);
    			append_dev(p, t6);
    			append_dev(p, a2);
    			append_dev(p, t8);
    			append_dev(p, a3);
    			append_dev(p, t10);
    			append_dev(p, a4);
    			append_dev(p, t12);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a0)),
    					action_destroyer(link_action_1 = link.call(null, a1)),
    					action_destroyer(link_action_2 = link.call(null, a2)),
    					action_destroyer(link_action_3 = link.call(null, a3)),
    					action_destroyer(link_action_4 = link.call(null, a4))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Secondary", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Secondary> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Secondary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Secondary",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/content/storage/magnetic.svelte generated by Svelte v3.31.0 */
    const file$f = "src/content/storage/magnetic.svelte";

    function create_fragment$i(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let t2;
    	let a0;
    	let link_action;
    	let t4;
    	let a1;
    	let link_action_1;
    	let t6;
    	let a2;
    	let link_action_2;
    	let t8;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Magnetic storage devices";
    			t1 = space();
    			p = element("p");
    			t2 = text("Magnetic storage devices store ");
    			a0 = element("a");
    			a0.textContent = "storage/binary";
    			t4 = text(" data (0s and 1s) using magnetic polarity: \n![[magneticdatastorage.png]]\nCommonly-used magnetic storage devices include ");
    			a1 = element("a");
    			a1.textContent = "hard disks";
    			t6 = text(" and ");
    			a2 = element("a");
    			a2.textContent = "magnetic tape";
    			t8 = text(". While they store data using magnetic polarity, they work in very different ways.");
    			add_location(h1, file$f, 2, 0, 60);
    			attr_dev(a0, "href", "/storage/binary");
    			add_location(a0, file$f, 3, 34, 128);
    			attr_dev(a1, "href", "/storage/hard_disks");
    			add_location(a1, file$f, 5, 47, 301);
    			attr_dev(a2, "href", "/storage/magnetic_tape");
    			add_location(a2, file$f, 5, 105, 359);
    			add_location(p, file$f, 3, 0, 94);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			append_dev(p, a0);
    			append_dev(p, t4);
    			append_dev(p, a1);
    			append_dev(p, t6);
    			append_dev(p, a2);
    			append_dev(p, t8);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a0)),
    					action_destroyer(link_action_1 = link.call(null, a1)),
    					action_destroyer(link_action_2 = link.call(null, a2))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Magnetic", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Magnetic> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Magnetic extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Magnetic",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/content/peripherals/binary.svelte generated by Svelte v3.31.0 */

    const file$g = "src/content/peripherals/binary.svelte";

    function create_fragment$j(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Another binary";
    			add_location(h1, file$g, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Binary", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Binary> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Binary$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Binary",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/Quiz.svelte generated by Svelte v3.31.0 */

    const { console: console_1$1 } = globals;
    const file$h = "src/Quiz.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (89:6) {#each question['answers'] as answer, answer_index}
    function create_each_block_1(ctx) {
    	let div;
    	let button;
    	let t_value = /*answer*/ ctx[10] + "";
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[5](/*question_index*/ ctx[9], /*answer_index*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", button_class_value = "btn " + /*active*/ ctx[1][/*question_index*/ ctx[9]][/*answer_index*/ ctx[12]] + " svelte-1l0v68a");
    			add_location(button, file$h, 90, 10, 1774);
    			attr_dev(div, "class", "answer svelte-1l0v68a");
    			add_location(div, file$h, 89, 8, 1743);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*questions*/ 1 && t_value !== (t_value = /*answer*/ ctx[10] + "")) set_data_dev(t, t_value);

    			if (dirty & /*active*/ 2 && button_class_value !== (button_class_value = "btn " + /*active*/ ctx[1][/*question_index*/ ctx[9]][/*answer_index*/ ctx[12]] + " svelte-1l0v68a")) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(89:6) {#each question['answers'] as answer, answer_index}",
    		ctx
    	});

    	return block;
    }

    // (86:2) {#each questions as question, question_index}
    function create_each_block(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*question*/ ctx[7]["question"] + "";
    	let t0;
    	let t1;
    	let each_value_1 = /*question*/ ctx[7]["answers"];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h2, file$h, 87, 6, 1645);
    			attr_dev(div, "class", "question svelte-1l0v68a");
    			add_location(div, file$h, 86, 4, 1616);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*questions*/ 1 && t0_value !== (t0_value = /*question*/ ctx[7]["question"] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*active, handleSelect, questions*/ 19) {
    				each_value_1 = /*question*/ ctx[7]["answers"];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(86:2) {#each questions as question, question_index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let div8;
    	let t0;
    	let div7;
    	let div6;
    	let div1;
    	let div0;
    	let t1;
    	let t2;
    	let div3;
    	let div2;
    	let t3;
    	let t4;
    	let div5;
    	let div4;
    	let each_value = /*questions*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div8 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t1 = text(/*correct*/ ctx[2]);
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t3 = text(/*incorrect*/ ctx[3]);
    			t4 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "stuff";
    			attr_dev(div0, "class", "data-column correct svelte-1l0v68a");
    			add_location(div0, file$h, 102, 8, 2102);
    			attr_dev(div1, "class", "col-sm-4");
    			add_location(div1, file$h, 101, 6, 2071);
    			attr_dev(div2, "class", "data-column incorrect svelte-1l0v68a");
    			add_location(div2, file$h, 105, 8, 2202);
    			attr_dev(div3, "class", "col-sm-4 ");
    			add_location(div3, file$h, 104, 6, 2170);
    			attr_dev(div4, "class", "data-column score svelte-1l0v68a");
    			add_location(div4, file$h, 108, 8, 2305);
    			attr_dev(div5, "class", "col-sm-4");
    			add_location(div5, file$h, 107, 6, 2274);
    			attr_dev(div6, "class", "row data-row svelte-1l0v68a");
    			add_location(div6, file$h, 100, 4, 2038);
    			attr_dev(div7, "class", "question svelte-1l0v68a");
    			add_location(div7, file$h, 99, 2, 2011);
    			attr_dev(div8, "class", "container");
    			add_location(div8, file$h, 84, 0, 1540);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div8, null);
    			}

    			append_dev(div8, t0);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div6, t2);
    			append_dev(div6, div3);
    			append_dev(div3, div2);
    			append_dev(div2, t3);
    			append_dev(div6, t4);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*questions, active, handleSelect*/ 19) {
    				each_value = /*questions*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div8, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*correct*/ 4) set_data_dev(t1, /*correct*/ ctx[2]);
    			if (dirty & /*incorrect*/ 8) set_data_dev(t3, /*incorrect*/ ctx[3]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Quiz", slots, []);
    	let { questions } = $$props;
    	let active = Array(questions.length).fill(false);

    	for (var i = 0; i < questions.length; i++) {
    		active[i] = Array(questions[i]["answers"].length).fill("unanswered");
    	}

    	let correct = 0;
    	let incorrect = 0;

    	function handleSelect(question_index, answer_index) {
    		console.log(questions[question_index]["answers"][answer_index]);

    		if (questions[question_index]["correct"][answer_index] == 1) {
    			$$invalidate(1, active[question_index][answer_index] = "correct", active);
    			$$invalidate(2, correct += 1);
    		} else {
    			$$invalidate(1, active[question_index][answer_index] = "incorrect", active);
    			$$invalidate(3, incorrect += 1);
    		}
    	}

    	const writable_props = ["questions"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Quiz> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (question_index, answer_index) => handleSelect(question_index, answer_index);

    	$$self.$$set = $$props => {
    		if ("questions" in $$props) $$invalidate(0, questions = $$props.questions);
    	};

    	$$self.$capture_state = () => ({
    		questions,
    		active,
    		i,
    		correct,
    		incorrect,
    		handleSelect
    	});

    	$$self.$inject_state = $$props => {
    		if ("questions" in $$props) $$invalidate(0, questions = $$props.questions);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    		if ("i" in $$props) i = $$props.i;
    		if ("correct" in $$props) $$invalidate(2, correct = $$props.correct);
    		if ("incorrect" in $$props) $$invalidate(3, incorrect = $$props.incorrect);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [questions, active, correct, incorrect, handleSelect, click_handler];
    }

    class Quiz extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { questions: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quiz",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*questions*/ ctx[0] === undefined && !("questions" in props)) {
    			console_1$1.warn("<Quiz> was created without expected prop 'questions'");
    		}
    	}

    	get questions() {
    		throw new Error("<Quiz>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set questions(value) {
    		throw new Error("<Quiz>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/content/peripherals/home.svelte generated by Svelte v3.31.0 */
    const file$i = "src/content/peripherals/home.svelte";

    function create_fragment$l(ctx) {
    	let h1;
    	let t1;
    	let p0;
    	let quiz;
    	let t2;
    	let a0;
    	let link_action;
    	let t4;
    	let a1;
    	let link_action_1;
    	let t6;
    	let a2;
    	let link_action_2;
    	let t8;
    	let a3;
    	let link_action_3;
    	let t10;
    	let a4;
    	let link_action_4;
    	let t12;
    	let em;
    	let t14;
    	let t15;
    	let p1;
    	let t17;
    	let blockquote;
    	let p2;
    	let current;
    	let mounted;
    	let dispose;

    	quiz = new Quiz({
    			props: {
    				questions: [
    					{
    						"question": "Which of the following is a duck?",
    						"answers": [" Beaver", " Mallard", " Panda"],
    						"correct": [0, 1, 0]
    					},
    					{
    						"question": "Is a duck an animal",
    						"answers": [" Nope", " Yes", " Maybe"],
    						"correct": [0, 1, 1]
    					}
    				]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Introduction";
    			t1 = space();
    			p0 = element("p");
    			create_component(quiz.$$.fragment);
    			t2 = space();
    			a0 = element("a");
    			a0.textContent = "peripherals/keyboard";
    			t4 = text(" and ");
    			a1 = element("a");
    			a1.textContent = "mouse";
    			t6 = text(" and ");
    			a2 = element("a");
    			a2.textContent = "peripherals/binary";
    			t8 = text(" vs. ");
    			a3 = element("a");
    			a3.textContent = "storage/binary";
    			t10 = text("\n![[magneticdatastorage.png]] ");
    			a4 = element("a");
    			a4.textContent = "peripherals/sub_perphs/testing";
    			t12 = text("\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\n--here--\n$[[![[magneticdatastorage.png]]Epigraphs are like blockquotes but ");
    			em = element("em");
    			em.textContent = "Epigraphs are italicized";
    			t14 = text(".]]");
    			t15 = space();
    			p1 = element("p");
    			p1.textContent = "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.";
    			t17 = space();
    			blockquote = element("blockquote");
    			p2 = element("p");
    			p2.textContent = "Testing blockquote";
    			add_location(h1, file$i, 3, 0, 94);
    			attr_dev(a0, "href", "/peripherals/keyboard");
    			add_location(a0, file$i, 5, 0, 358);
    			attr_dev(a1, "href", "/peripherals/mouse");
    			add_location(a1, file$i, 5, 70, 428);
    			attr_dev(a2, "href", "/peripherals/binary");
    			add_location(a2, file$i, 5, 122, 480);
    			attr_dev(a3, "href", "/storage/binary");
    			add_location(a3, file$i, 5, 188, 546);
    			attr_dev(a4, "href", "/peripherals/sub_perphs/testing");
    			add_location(a4, file$i, 6, 29, 629);
    			add_location(em, file$i, 9, 66, 1404);
    			add_location(p0, file$i, 4, 0, 116);
    			add_location(p1, file$i, 10, 0, 1445);
    			add_location(p2, file$i, 12, 0, 2216);
    			add_location(blockquote, file$i, 11, 0, 2203);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			mount_component(quiz, p0, null);
    			append_dev(p0, t2);
    			append_dev(p0, a0);
    			append_dev(p0, t4);
    			append_dev(p0, a1);
    			append_dev(p0, t6);
    			append_dev(p0, a2);
    			append_dev(p0, t8);
    			append_dev(p0, a3);
    			append_dev(p0, t10);
    			append_dev(p0, a4);
    			append_dev(p0, t12);
    			append_dev(p0, em);
    			append_dev(p0, t14);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, blockquote, anchor);
    			append_dev(blockquote, p2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a0)),
    					action_destroyer(link_action_1 = link.call(null, a1)),
    					action_destroyer(link_action_2 = link.call(null, a2)),
    					action_destroyer(link_action_3 = link.call(null, a3)),
    					action_destroyer(link_action_4 = link.call(null, a4))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(quiz.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(quiz.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			destroy_component(quiz);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(blockquote);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Quiz, link });
    	return [];
    }

    class Home$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src/content/peripherals/bananas.svelte generated by Svelte v3.31.0 */
    const file$j = "src/content/peripherals/bananas.svelte";

    function create_fragment$m(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "testing\n[[!521799568069754890.png]]";
    			add_location(p, file$j, 2, 0, 60);
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
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Bananas", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Bananas> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Bananas extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bananas",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/content/peripherals/mouse.svelte generated by Svelte v3.31.0 */
    const file$k = "src/content/peripherals/mouse.svelte";

    function create_fragment$n(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let t2;
    	let a;
    	let link_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Mouse";
    			t1 = space();
    			p = element("p");
    			t2 = text("This is a mouse ");
    			a = element("a");
    			a.textContent = "storage/binary";
    			add_location(h1, file$k, 2, 0, 60);
    			attr_dev(a, "href", "/storage/binary");
    			add_location(a, file$k, 3, 19, 94);
    			add_location(p, file$k, 3, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			append_dev(p, a);

    			if (!mounted) {
    				dispose = action_destroyer(link_action = link.call(null, a));
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Mouse", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Mouse> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Mouse extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mouse",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src/content/peripherals/keyboard.svelte generated by Svelte v3.31.0 */
    const file$l = "src/content/peripherals/keyboard.svelte";

    function create_fragment$o(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let t2;
    	let a0;
    	let link_action;
    	let t4;
    	let a1;
    	let link_action_1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Keyboard";
    			t1 = space();
    			p = element("p");
    			t2 = text("link to ");
    			a0 = element("a");
    			a0.textContent = "mouse";
    			t4 = space();
    			a1 = element("a");
    			a1.textContent = "peripherals/binary";
    			add_location(h1, file$l, 2, 0, 60);
    			attr_dev(a0, "href", "/peripherals/mouse");
    			add_location(a0, file$l, 3, 11, 89);
    			attr_dev(a1, "href", "/peripherals/binary");
    			add_location(a1, file$l, 3, 59, 137);
    			add_location(p, file$l, 3, 0, 78);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			append_dev(p, a0);
    			append_dev(p, t4);
    			append_dev(p, a1);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a0)),
    					action_destroyer(link_action_1 = link.call(null, a1))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Keyboard", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Keyboard> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Keyboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src/content/peripherals/sub_perphs/question1.svelte generated by Svelte v3.31.0 */

    function create_fragment$p(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Question1", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Question1> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Question1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Question1",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* src/content/peripherals/sub_perphs/testing.svelte generated by Svelte v3.31.0 */
    const file$m = "src/content/peripherals/sub_perphs/testing.svelte";

    function create_fragment$q(ctx) {
    	let p;
    	let t;
    	let quiz;
    	let current;

    	quiz = new Quiz({
    			props: {
    				questions: [
    					{
    						"question": "Which of the following is a duck?",
    						"answers": [" Beaver", " Mallard", " Panda"],
    						"correct": [0, 1, 0]
    					},
    					{
    						"question": "Is a duck an animal",
    						"answers": [" Nope", " Yes", " Maybe"],
    						"correct": [0, 1, 1]
    					}
    				]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text("this is testing\n");
    			create_component(quiz.$$.fragment);
    			add_location(p, file$m, 2, 0, 52);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    			mount_component(quiz, p, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(quiz.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(quiz.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			destroy_component(quiz);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Testing", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Testing> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Quiz });
    	return [];
    }

    class Testing$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Testing",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src/content/peripherals/quizzes/question1.svelte generated by Svelte v3.31.0 */

    const file$n = "src/content/peripherals/quizzes/question1.svelte";

    function create_fragment$r(ctx) {
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "q: Which of the following is a duck?\n(): Beaver\n(x): Mallard\n( ): Panda";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "q: Is a duck an animal\n( ): Nope\n(X): Yes\n(X): Maybe";
    			add_location(p0, file$n, 0, 0, 0);
    			add_location(p1, file$n, 4, 0, 79);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Question1", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Question1> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Question1$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Question1",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.0 */
    const file$o = "src/App.svelte";

    // (65:2) <span slot="sidebar">
    function create_sidebar_slot(ctx) {
    	let span;
    	let a0;
    	let link_action;
    	let active_action;
    	let br0;
    	let t1;
    	let a1;
    	let link_action_1;
    	let active_action_1;
    	let br1;
    	let t3;
    	let a2;
    	let link_action_2;
    	let active_action_2;
    	let br2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			a0 = element("a");
    			a0.textContent = "with space";
    			br0 = element("br");
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "storage";
    			br1 = element("br");
    			t3 = space();
    			a2 = element("a");
    			a2.textContent = "peripherals";
    			br2 = element("br");
    			attr_dev(a0, "href", "/with_space/home");
    			add_location(a0, file$o, 64, 24, 3144);
    			add_location(br0, file$o, 64, 85, 3205);
    			attr_dev(a1, "href", "/storage/home");
    			add_location(a1, file$o, 65, 0, 3212);
    			add_location(br1, file$o, 65, 55, 3267);
    			attr_dev(a2, "href", "/peripherals/home");
    			add_location(a2, file$o, 66, 0, 3274);
    			add_location(br2, file$o, 66, 63, 3337);
    			attr_dev(span, "slot", "sidebar");
    			add_location(span, file$o, 64, 2, 3122);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, a0);
    			append_dev(span, br0);
    			append_dev(span, t1);
    			append_dev(span, a1);
    			append_dev(span, br1);
    			append_dev(span, t3);
    			append_dev(span, a2);
    			append_dev(span, br2);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a0)),
    					action_destroyer(active_action = active.call(null, a0)),
    					action_destroyer(link_action_1 = link.call(null, a1)),
    					action_destroyer(active_action_1 = active.call(null, a1)),
    					action_destroyer(link_action_2 = link.call(null, a2)),
    					action_destroyer(active_action_2 = active.call(null, a2))
    				];

    				mounted = true;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_sidebar_slot.name,
    		type: "slot",
    		source: "(65:2) <span slot=\\\"sidebar\\\">",
    		ctx
    	});

    	return block;
    }

    // (69:2) <span slot="content">
    function create_content_slot(ctx) {
    	let span;
    	let div4;
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let router;
    	let t1;
    	let div2;
    	let current;

    	router = new Router({
    			props: { routes: /*routes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			create_component(router.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "col-md-1");
    			add_location(div0, file$o, 71, 8, 3447);
    			attr_dev(div1, "class", "col-md-8");
    			add_location(div1, file$o, 72, 8, 3480);
    			attr_dev(div2, "class", "col-md-3");
    			add_location(div2, file$o, 75, 8, 3556);
    			attr_dev(div3, "class", "columns");
    			add_location(div3, file$o, 70, 6, 3417);
    			attr_dev(div4, "class", "container-fluid");
    			add_location(div4, file$o, 69, 4, 3381);
    			attr_dev(span, "slot", "content");
    			add_location(span, file$o, 68, 2, 3355);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			mount_component(router, div1, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
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
    			if (detaching) detach_dev(span);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot.name,
    		type: "slot",
    		source: "(69:2) <span slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (64:0) <Sidebar>
    function create_default_slot(ctx) {
    	let t;

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
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(64:0) <Sidebar>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let sidebar;
    	let current;

    	sidebar = new Sidebar({
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
    			create_component(sidebar.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sidebar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sidebar_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				sidebar_changes.$$scope = { dirty, ctx };
    			}

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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	const routes = {
    		"/with_space/goods": Goods,
    		"/with_space/home": Home,
    		"/with_space/testing": Testing,
    		"/storage/magnetic_tape": Magnetic_tape,
    		"/storage/optical": Optical,
    		"/storage/serial": Serial,
    		"/storage/direct": Direct,
    		"/storage/SSD": SSD,
    		"/storage/hard_disks": Hard_disks,
    		"/storage/primary": Primary,
    		"/storage/backup": Backup,
    		"/storage/data": Data,
    		"/storage/binary": Binary,
    		"/storage/home": Home$1,
    		"/storage/solid_state": Solid_state,
    		"/storage/secondary": Secondary,
    		"/storage/magnetic": Magnetic,
    		"/peripherals/binary": Binary$1,
    		"/peripherals/home": Home$2,
    		"/peripherals/bananas": Bananas,
    		"/peripherals/mouse": Mouse,
    		"/peripherals/keyboard": Keyboard,
    		"/peripherals/sub_perphs/question1": Question1,
    		"/peripherals/sub_perphs/testing": Testing$1,
    		"/peripherals/quizzes/question1": Question1$1
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Sidebar,
    		Router,
    		active,
    		link,
    		With_space_goods: Goods,
    		With_space_home: Home,
    		With_space_testing: Testing,
    		Storage_magnetic_tape: Magnetic_tape,
    		Storage_optical: Optical,
    		Storage_serial: Serial,
    		Storage_direct: Direct,
    		Storage_ssd: SSD,
    		Storage_hard_disks: Hard_disks,
    		Storage_primary: Primary,
    		Storage_backup: Backup,
    		Storage_data: Data,
    		Storage_binary: Binary,
    		Storage_home: Home$1,
    		Storage_solid_state: Solid_state,
    		Storage_secondary: Secondary,
    		Storage_magnetic: Magnetic,
    		Peripherals_binary: Binary$1,
    		Peripherals_home: Home$2,
    		Peripherals_bananas: Bananas,
    		Peripherals_mouse: Mouse,
    		Peripherals_keyboard: Keyboard,
    		Peripherals_sub_perphs_question1: Question1,
    		Peripherals_sub_perphs_testing: Testing$1,
    		Peripherals_quizzes_question1: Question1$1,
    		routes
    	});

    	return [routes];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$s.name
    		});
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
//# sourceMappingURL=bundle.js.map
