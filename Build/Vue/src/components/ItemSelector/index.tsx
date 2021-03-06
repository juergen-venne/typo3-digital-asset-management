import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation, State} from 'vuex-class';
import {Mutations} from '@/enums/Mutations';
import {ResourceInterface} from '@/interfaces/ResourceInterface';

@Component
export default class ItemSelector extends Vue {

    get isSelected(): boolean {
        return this.selected.includes(this.item);
    }
    @Mutation(Mutations.SELECT_ITEM)
    selectItem: any;

    @Mutation(Mutations.UNSELECT_ITEM)
    unselectItem: any;

    @State
    selected!: Array<ResourceInterface>;

    @Prop()
    item!: ResourceInterface;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        const randomPart: string =  Math.random().toString(36).substring(7);
        const label: string = this.isSelected ? TYPO3.lang['ItemSelector.label.deselect'] : TYPO3.lang['ItemSelector.label.select'];
        return (
            <a href='#' onClick={(event: Event) => this.toggleSelect(event, this.item)} className='btn btn-sm btn-default'>
                <i class='fa fa-check-square' v-show={this.isSelected} />
                <i class='fa fa-square-o' v-show={!this.isSelected} />
            </a>
        );
    }

    private toggleSelect(event: Event, item: ResourceInterface): void {
        event.stopPropagation();
        this.selected.includes(item)
            ? this.unselectItem(item)
            : this.selectItem(item);
    }
}
