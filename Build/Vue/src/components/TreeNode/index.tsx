import {AjaxRoutes} from '@/enums/AjaxRoutes';
import FolderTreeNode from '@/interfaces/FolderTreeNode';
import {CreateElement, VNode} from 'vue';
import {Component, Prop, Vue} from 'vue-property-decorator';
import {Action} from 'vuex-class';

@Component
export default class TreeNode extends Vue {
    @Action(AjaxRoutes.damGetFolderItems)
    fetchData: any;

    @Action(AjaxRoutes.damGetTreeFolders)
    fetchTreeData: any;

    @Prop()
    tree!: any;

    @Prop()
    node!: FolderTreeNode;

    constructor(props: any) {
        super(props);
    }

    // lifecycle method
    mounted(): void {
        if (this.$props.node.expanded) {
            this.fetchTreeData(this.$props.node.identifier);
        }
    }

    private render(h: CreateElement): VNode {
        const controlClassName = 'list-tree-control ' + (this.node.expanded ? 'list-tree-control-open' : 'list-tree-control-closed');
        return(
            <span class='list-tree-group' data-identifier={this.node.identifier}>
                <a class={controlClassName} href='#' v-show={this.node.hasChildren} onclick={() => this.toggleNode(this.$props.node)}>
                    <i class='fa'></i>
                </a>
                <a href='#' data-identifier={this.node.identifier} onclick={() => this.fetchData(this.$props.node.identifier)}>
                    <img src={this.node.icon} width='16' height='16' /> {this.node.name}
                </a>
            </span>
        );
    }

    /**
     * Called by TreeNode
     *
     * @param {FolderTreeNode} node
     */
    private toggleNode(node: FolderTreeNode): void {
        node.expanded = !node.expanded;

        if (node.expanded) {
            if (node.hasChildren && !node.folders.length) {
                this.fetchTreeData(node.identifier);
            }
        } else {
            // Collapse all children
            for (let nodeToCollapse of node.folders.filter((child: FolderTreeNode) => child.expanded)) {
                this.toggleNode(nodeToCollapse);
            }
        }
    }
}
