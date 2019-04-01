import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {FileType} from '@/enums/FileType';
import FolderTreeNode from '@/interfaces/FolderTreeNode';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {Component, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import TreeNode from '@/components/TreeNode';
import {Action, State} from 'vuex-class';
import {DraggableService, DragConfiguration} from '@/services/DraggableService';

@Component
export default class Tree extends Vue {
    @Action(AjaxRoutes.damGetTreeFolders)
    fetchTreeData: any;

    @State
    storage!: StorageInterface;

    private draggableService: DraggableService;

    constructor(props: any) {
        super(props);

        const configuration: DragConfiguration = {
            draggableElements: 'li[data-type="' + FileType.FOLDER + '"] .list-tree-group',
            dropInto: 'li[data-type="' + FileType.FOLDER + '"] .list-tree-group',
        };
        this.draggableService = new DraggableService(configuration);
    }

    mounted(): void {
        this.fetchTreeData(this.storage.identifier);
        this.draggableService.makeDraggable();
    }

    private render(h: CreateElement): VNode|null {
        if (!this.storage.folders) {
            return null;
        }

        const nodes = [this.storage.folders].map(this.generateNodes, this);
        return(
            <div><ul class='list-tree list-tree-root'><li>{nodes}</li></ul></div>
        );
    }

    private generateNodes(nodeCollection: any): VNode {
        const collection = nodeCollection.map(this.generateNode, this);
        return(
            <ul class='list-tree'>
                {collection}
            </ul>
        );
    }

    private generateNode(node: FolderTreeNode): VNode {
        let treeNodeElement = <TreeNode tree={this} node={node}></TreeNode>;
        let childNodes;
        if (node.expanded && node.hasChildren && node.folders.length) {
            childNodes = [node.folders].map(this.generateNodes, this);
        }

        return(
            <li data-type={FileType.FOLDER}>
                {treeNodeElement}
                {childNodes}
            </li>
        );
    }
}
