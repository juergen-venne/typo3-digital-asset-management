import FolderTreeNode from '@/interfaces/FolderTreeNode';
import {StorageInterface} from '@/interfaces/StorageInterface';
import Vue from 'vue';
import Vuex, {StoreOptions} from 'vuex';
import {RootState} from 'types/types';
import client from '@/services/http/Typo3Client';
import {FolderInterface} from '@/interfaces/FolderInterface';
import {FileInterface} from '@/interfaces/FileInterface';
import {ImageInterface} from '@/interfaces/ImageInterface';
import {ViewType} from '@/enums/ViewType';
import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {SortingFields, SortingOrder} from '@/enums/Sorting';
import {ResourceInterface} from '@/interfaces/ResourceInterface';
import {Mutations} from '@/enums/Mutations';

Vue.use(Vuex);
// https://codeburst.io/vuex-and-typescript-3427ba78cfa8
// further type definitions missing, just an example on how to use the store.
const options: StoreOptions<RootState> = {
    state: {
        selected: [],
        itemsGrouped: {
            folders: [],
            files: [],
            images: [],
        },
        sorting: {
            field: 'name',
            order: 'ASC',
        },
        items: [],
        current: '',
        viewMode: ViewType.TILE,
        showTree: true,
        activeStorage: null,
        storages: [],
        treeIdentifierLocationMap: {},
    },
    mutations: {
        [Mutations.FETCH_DATA](state: RootState, items: {
                folders: Array<FolderInterface>,
                files: Array<FileInterface>,
                images: Array<ImageInterface>,
        }): void {
            const sortItems = (a: any, b: any) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'});

            state.itemsGrouped = items;
            state.items = [...items.files, ...items.images, ...items.folders];

            // default sort order - ugly duplication
            state.items.sort(sortItems);
            state.itemsGrouped.folders.sort(sortItems);
            state.itemsGrouped.files.sort(sortItems);
            state.itemsGrouped.images.sort(sortItems);
        },
        [Mutations.FETCH_STORAGES](state: RootState, data: Array<StorageInterface>): void {
            state.storages = data;

            // TODO: Set active storage by value stored in UC
            state.activeStorage = {
                folders: [],
                storage: data[0],
            };
        },
        [Mutations.SET_STORAGE](state: RootState, identifier: string): void {
            // state.storage.identifier = 0;
        },
        [Mutations.SELECT_ITEM](state: RootState, identifier: String): void {
            if (!state.selected.includes(identifier)) {
                state.selected.push(identifier);
            }
        },
        [Mutations.UNSELECT_ITEM](state: RootState, identifier: String): void {
            if (state.selected.includes(identifier)) {
                state.selected.splice(state.selected.indexOf(identifier), 1);
            }
        },
        [Mutations.SELECT_ALL](state: RootState, listOfIdentifiers: Array<String>): void {
            state.selected = listOfIdentifiers;
        },
        [Mutations.UNSELECT_ALL](state: RootState): void {
            state.selected = [];
        },
        [Mutations.NAVIGATE](state: RootState, identifier: String): void {
            state.current = identifier;
            state.selected = [];
        },
        [Mutations.SWITCH_VIEW](state: RootState, viewMode: String): void {
            state.viewMode = viewMode;
        },
        [Mutations.FETCH_TREE_DATA](state: RootState, data: {identifier: string, folders: Array<FolderTreeNode>}): void {
            if (!state.activeStorage) {
                return;
            }

            const nestingStructure = state.treeIdentifierLocationMap[data.identifier] || [];

            data.folders.forEach((node: FolderTreeNode, index: number): void => {
                node.folders = [];

                // Store folder identifier and nesting information into state for faster tree traversal
                const nesting = nestingStructure.slice(0); // This clones the nesting structure
                nesting.push(index);
                state.treeIdentifierLocationMap[node.identifier] = nesting;
            });

            if (data.identifier.match(/^\d+:\/$/)) {
                // Storage root requested
                state.activeStorage.folders = data.folders;
            } else {
                let node;
                let folders = state.activeStorage.folders;
                for (let index of nestingStructure) {
                    node = folders[index];
                    folders = folders[index].folders;
                }
                if (typeof node !== 'undefined') {
                    node.folders = data.folders;
                }
            }
        },
        [Mutations.TOGGLE_TREE](state: RootState): void {
            state.showTree = !state.showTree;
        },
        [Mutations.CHANGE_SORTING](state: RootState, sorting: SortingFields): void {
            const stringSort = (a: ResourceInterface, b: ResourceInterface) => a[sorting].localeCompare(
                b[sorting],
                undefined,
                {numeric: true, sensitivity: 'base'},
            );
            const numberSort = (a: ResourceInterface, b: ResourceInterface) => a[sorting] < b[sorting];

            const sortItems = ([SortingFields.MTIME, SortingFields.SIZE].indexOf(sorting) === -1)
                ? stringSort
                : numberSort;

            state.sorting.field = sorting;
            state.items.sort(sortItems);
            state.itemsGrouped.folders.sort(sortItems);
            state.itemsGrouped.files.sort(sortItems);
            state.itemsGrouped.images.sort(sortItems);
        },
        [Mutations.CHANGE_SORTORDER](state: RootState, sortOrder: SortingOrder): void {
            if (state.sorting.order !== sortOrder) {
                state.sorting.order = sortOrder;
                state.items.reverse();
                state.itemsGrouped.folders.reverse();
                state.itemsGrouped.files.reverse();
                state.itemsGrouped.images.reverse();
            }

        },
    },
    actions: {
        async [Mutations.FETCH_DATA]({commit}: any, identifier: String): Promise<any> {
            commit(Mutations.NAVIGATE, identifier);
            // request [dummy data]:
            const response = await client.get('http://localhost:8080/api/files.json?identifier=' + identifier);
            commit(Mutations.FETCH_DATA, response.data);
        },
        async [AjaxRoutes.damGetFolderItems]({commit}: any, identifier: String): Promise<any> {
            commit(Mutations.NAVIGATE, identifier);
            const response = await client.get(TYPO3.settings.ajaxUrls[AjaxRoutes.damGetFolderItems] + '&identifier=' + identifier);
            commit(Mutations.FETCH_DATA, response.data);
        },
        async [AjaxRoutes.damGetStoragesAndMounts]({commit}: any, identifier: String): Promise<any> {
            commit(Mutations.NAVIGATE, identifier);
            const response = await client.get(TYPO3.settings.ajaxUrls[AjaxRoutes.damGetStoragesAndMounts] + '&identifier=' + identifier);
            commit(Mutations.FETCH_DATA, response.data);
        },
        async [AjaxRoutes.damGetTreeFolders]({commit}: any, identifier: string): Promise<any> {
            const response = await client.get(TYPO3.settings.ajaxUrls[AjaxRoutes.damGetTreeFolders] + '&identifier=' + identifier);
            commit(Mutations.FETCH_TREE_DATA, {identifier: identifier, folders: response.data});
        },
        async [AjaxRoutes.damGetStoragesAndMounts]({commit}: any): Promise<any> {
            const response = await client.get(TYPO3.settings.ajaxUrls[AjaxRoutes.damGetStoragesAndMounts]);
            commit(Mutations.FETCH_STORAGES, response.data);
        },
        async [Mutations.SET_STORAGE]({commit, dispatch}: any, identifier: string): Promise<any> {
            commit(Mutations.SET_STORAGE, identifier);
            dispatch(AjaxRoutes.damGetFolderItems, identifier);
            dispatch(AjaxRoutes.damGetTreeFolders, identifier);
        },
    },
};
export default new Vuex.Store<RootState>(options);
